from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    location: Optional[str] = None
    weather_context: Optional[str] = None

class DetectionObject(BaseModel):
    label: str
    confidence: float
    bbox: List[float]

class ImageAnalysisResponse(BaseModel):
    detections: List[DetectionObject]
    severity_score: float
    gemini_analysis: str
    cropped_image_base64: Optional[str] = None

class DuplicateCheckRequest(BaseModel):
    image_base64: str
    recent_images_base64: List[str]

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    similarity_score: float
    match_index: Optional[int] = None

class ForecastRequest(BaseModel):
    dates: List[str]
    counts: List[int]
    periods: int = 7

class ForecastResponse(BaseModel):
    forecast_dates: List[str]
    forecast_counts: List[float]
    anomalies_detected: bool

class LocationPoint(BaseModel):
    lat: float
    lng: float
    id: str

class HotspotRequest(BaseModel):
    points: List[LocationPoint]

class HotspotResponse(BaseModel):
    clusters: List[List[str]]  # List of clusters, each containing point IDs
    noise: List[str]

class PrioritizeRequest(BaseModel):
    description: str
    yolo_severity: float
    cluster_density: int

class PrioritizeResponse(BaseModel):
    priority_score: float
    priority_label: str

class BudgetOptimizationRequest(BaseModel):
    total_budget: float

class PredictiveMaintenanceRequest(BaseModel):
    ward_id: str
    rainfall_mm: float
    road_age_years: float
    traffic_volume: int

class OutbreakPredictionRequest(BaseModel):
    stagnant_water_reports: int
    avg_temp_c: float
    population_density: int
