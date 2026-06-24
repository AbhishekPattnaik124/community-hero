from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

from app.services.hotspot_predictor import HotspotPredictor
from app.services.priority_scorer import IssuePriorityScorer
from app.services.resolution_predictor import ResolutionTimePredictor
from app.services.engagement_predictor import EngagementPredictor

router = APIRouter()

# Instantiate singletons for the models
hotspot_model = HotspotPredictor(eps_km=0.5, min_samples=3)
priority_model = IssuePriorityScorer()
resolution_model = ResolutionTimePredictor()
engagement_model = EngagementPredictor()

# Create dummy training data to initialize models on startup
def initialize_models():
    # 1. Hotspot dummy data
    df_hotspot = pd.DataFrame({
        'lat': np.random.normal(40.7128, 0.01, 100).tolist() + np.random.normal(40.7500, 0.01, 50).tolist(),
        'lng': np.random.normal(-74.0060, 0.01, 100).tolist() + np.random.normal(-73.9800, 0.01, 50).tolist(),
        'ds': pd.date_range(start='2023-01-01', periods=150, freq='D')
    })
    hotspot_model.fit_clusters(df_hotspot)
    
    # 2. Priority dummy data
    df_priority = pd.DataFrame({
        'severityScore': np.random.randint(0, 100, 100),
        'upvotes': np.random.randint(0, 50, 100),
        'locationRisk': np.random.rand(100),
        'issueAgeHours': np.random.randint(1, 48, 100),
        'weatherRisk': np.random.rand(100),
        'citizenImpact': np.random.rand(100)
    })
    y_priority = df_priority['severityScore'] * 0.5 + df_priority['upvotes'] * 0.3 + np.random.normal(0, 5, 100)
    y_priority = np.clip(y_priority, 0, 100)
    priority_model.fit(df_priority, y_priority)
    
    # 3. Resolution dummy data
    df_resolution = pd.DataFrame({
        'category': np.random.choice(['roads', 'water', 'electricity', 'other'], 100),
        'zone': np.random.choice(['north', 'south', 'east', 'west'], 100),
        'sla_performance_index': np.random.rand(100) * 2,
        'active_issues_load': np.random.randint(1, 20, 100),
        'severityScore': np.random.randint(0, 100, 100),
        'hours_to_resolve': np.random.randint(24, 168, 100)
    })
    resolution_model.fit(df_resolution)

# Initialize synchronously on import
initialize_models()

# --- Pydantic Schemas ---

class PriorityRequest(BaseModel):
    severityScore: int = Field(..., ge=0, le=100)
    upvotes: int = Field(default=0)
    locationRisk: float = Field(default=0.5, ge=0.0, le=1.0)
    issueAgeHours: int = Field(default=1)
    weatherRisk: float = Field(default=0.0, ge=0.0, le=1.0)
    citizenImpact: float = Field(default=0.5, ge=0.0, le=1.0)

class ResolutionRequest(BaseModel):
    category: str
    zone: str
    sla_performance_index: float = 1.0
    active_issues_load: int = 5
    severityScore: int = 50

class ZoneMetric(BaseModel):
    zone_id: str
    population_density: int
    infrastructure_age_years: int
    actual_reports_last_30d: int
    boundary: List[List[float]] # [[lng, lat], ...]

# --- Endpoints ---

@router.get("/predict/hotspots")
async def get_predicted_hotspots(horizon_days: int = 7):
    """
    Returns GeoJSON FeatureCollection of DBSCAN+Prophet predicted hotspots.
    """
    try:
        geojson_data = hotspot_model.generate_geojson(horizon_days=horizon_days)
        return geojson_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/priority")
async def predict_issue_priority(request: PriorityRequest):
    """
    Returns Random Forest priority score 0-100 along with SHAP explainability.
    """
    try:
        result = priority_model.predict(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/resolution-time")
async def predict_resolution_time(request: ResolutionRequest):
    """
    Returns Gradient Boosting estimated resolution time in hours.
    """
    try:
        result = resolution_model.predict(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/underreported-zones")
async def find_underreported_zones(zones: List[ZoneMetric]):
    """
    Analyzes list of zones to find areas where reporting is suspiciously low 
    compared to expected incident rates (Dark Zones).
    Returns GeoJSON FeatureCollection.
    """
    try:
        zone_dicts = [z.model_dump() for z in zones]
        geojson_data = engagement_model.find_underreported_zones(zone_dicts)
        return geojson_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
