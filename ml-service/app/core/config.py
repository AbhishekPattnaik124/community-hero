from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App Config
    PROJECT_NAME: str = "Community Hero ML Service"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Gemini Config
    GEMINI_API_KEY: str = "placeholder_key_if_not_set"

    # Kafka Config
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_INPUT_TOPIC: str = "civic-issues-raw"
    KAFKA_OUTPUT_TOPIC: str = "civic-issues-processed"
    
    # Model Config
    YOLO_MODEL_PATH: str = "yolov8n.pt"  # Auto-downloads if not present
    CNN_MODEL_PATH: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
