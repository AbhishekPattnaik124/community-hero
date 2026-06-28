import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import router
from app.core.kafka_client import kafka_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start Kafka Producer (with timeout to prevent hanging if Kafka is down)
    import asyncio
    try:
        await asyncio.wait_for(kafka_manager.start(), timeout=5.0)
        logger.info("ML Service started successfully (with Kafka).")
    except asyncio.TimeoutError:
        logger.warning("Kafka Producer start timed out (skipping). ML Service starting without Kafka.")
    except Exception as e:
        logger.warning(f"Kafka Producer failed to start: {e}. ML Service starting without Kafka.")
    
    yield
    # Shutdown: Stop Kafka Producer
    try:
        await asyncio.wait_for(kafka_manager.stop(), timeout=3.0)
    except Exception:
        pass
    logger.info("ML Service shutdown gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

from app.api.routes import router as default_router
from app.api.endpoints.predictions import router as predictions_router

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(default_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR, tags=["predictions"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
