from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import (
    ImageAnalysisRequest, ImageAnalysisResponse,
    DuplicateCheckRequest, DuplicateCheckResponse,
    ForecastRequest, ForecastResponse,
    HotspotRequest, HotspotResponse,
    PrioritizeRequest, PrioritizeResponse,
    BudgetOptimizationRequest, PredictiveMaintenanceRequest, OutbreakPredictionRequest
)
from app.services.vision_service import vision_service
from app.services.analytics_service import analytics_service
from app.services.optimization_service import optimization_service
from app.services.predictive_service import predictive_service
from app.utils.image_utils import decode_base64_image, encode_image_base64

router = APIRouter()

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(request: ImageAnalysisRequest):
    try:
        image = decode_base64_image(request.image_base64)
        result = await vision_service.analyze_image(
            image, 
            location=request.location, 
            weather=request.weather_context
        )
        
        # Convert cropped image back to base64 if it exists
        crop_b64 = None
        if result["cropped_image"]:
            crop_b64 = encode_image_base64(result["cropped_image"])

        return ImageAnalysisResponse(
            detections=result["detections"],
            severity_score=result["severity_score"],
            gemini_analysis=result["gemini_analysis"],
            cropped_image_base64=crop_b64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-duplicates", response_model=DuplicateCheckResponse)
async def detect_duplicates_endpoint(request: DuplicateCheckRequest):
    try:
        target_img = decode_base64_image(request.image_base64)
        recent_imgs = [decode_base64_image(b64) for b64 in request.recent_images_base64]
        
        result = vision_service.check_duplicate(target_img, recent_imgs)
        return DuplicateCheckResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast-trends", response_model=ForecastResponse)
async def forecast_trends_endpoint(request: ForecastRequest):
    try:
        result = analytics_service.forecast_trends(request.dates, request.counts, request.periods)
        return ForecastResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-hotspots", response_model=HotspotResponse)
async def detect_hotspots_endpoint(request: HotspotRequest):
    try:
        # Convert Pydantic objects to dicts
        points_list = [p.dict() for p in request.points]
        result = analytics_service.detect_hotspots(points_list)
        return HotspotResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prioritize-issue", response_model=PrioritizeResponse)
async def prioritize_issue_endpoint(request: PrioritizeRequest):
    try:
        result = analytics_service.score_priority(
            request.description, 
            request.yolo_severity, 
            request.cluster_density
        )
        return PrioritizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-budget")
async def optimize_budget_endpoint(request: BudgetOptimizationRequest):
    try:
        result = optimization_service.optimize_budget(request.total_budget)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown optimization error"))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-maintenance")
async def predict_maintenance_endpoint(request: PredictiveMaintenanceRequest):
    try:
        result = predictive_service.predict_potholes(
            request.ward_id, 
            request.rainfall_mm, 
            request.road_age_years, 
            request.traffic_volume
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-outbreak")
async def predict_outbreak_endpoint(request: OutbreakPredictionRequest):
    try:
        result = predictive_service.predict_dengue_outbreak(
            request.stagnant_water_reports, 
            request.avg_temp_c, 
            request.population_density
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
