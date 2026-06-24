import pandas as pd
import numpy as np

class PredictiveService:
    def predict_potholes(self, ward_id: str, rainfall_mm: float, road_age_years: float, traffic_volume: int):
        """
        Simulates a predictive maintenance model for potholes based on monsoon correlation.
        In production, this would use a Scikit-Learn RandomForest or XGBoost trained on 3 years of KMC data.
        """
        # Base risk
        risk_score = 0.1
        
        # Heavy rain sharply increases pothole risk
        if rainfall_mm > 100:
            risk_score += 0.4
        elif rainfall_mm > 50:
            risk_score += 0.2
            
        # Road age degradation
        risk_score += (road_age_years / 20.0) * 0.3
        
        # Traffic wear and tear (normalized assuming max 100k vehicles/day)
        risk_score += min((traffic_volume / 100000.0) * 0.2, 0.2)
        
        # Cap at 99%
        probability = min(risk_score, 0.99)
        
        return {
            "ward_id": ward_id,
            "prediction_window": "30 days",
            "pothole_formation_probability": probability,
            "preventive_cost_inr": 50000,
            "reactive_cost_inr": 200000,
            "roi_preventive": 300  # 300% ROI
        }

    def predict_dengue_outbreak(self, stagnant_water_reports: int, avg_temp_c: float, population_density: int):
        """
        Simulates a logistic regression outbreak probability model.
        Combines stagnant water, temperature (Aedes mosquito thrives in 25-30C), and density.
        """
        # Ideal mosquito temp is around 28C
        temp_factor = 1.0 if (25 <= avg_temp_c <= 32) else 0.4
        
        # Base multiplier from stagnant water issues
        water_factor = min(stagnant_water_reports / 50.0, 1.0)
        
        # Density multiplier (higher density = faster spread)
        density_factor = min(population_density / 30000.0, 1.0)
        
        # Combine weights
        probability = (water_factor * 0.5) + (temp_factor * 0.3) + (density_factor * 0.2)
        
        return {
            "prediction_window": "14 days",
            "outbreak_probability": round(probability, 2),
            "alert_level": "CRITICAL" if probability > 0.75 else "WARNING" if probability > 0.5 else "SAFE",
            "recommended_action": "Trigger preventive fogging schedule" if probability > 0.5 else "Monitor"
        }

predictive_service = PredictiveService()
