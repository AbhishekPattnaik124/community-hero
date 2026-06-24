import logging
import numpy as np
import pandas as pd
from typing import List, Dict

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.nlp = None
        self.prophet_loaded = False
        try:
            import spacy
            # Loads the small English model. If not installed, it will fail gracefully.
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy NLP model")
        except Exception as e:
            logger.warning(f"Could not load spaCy model. NLP features mocked. Run: python -m spacy download en_core_web_sm. Error: {e}")

        try:
            from prophet import Prophet
            self.prophet_loaded = True
            logger.info("Prophet is available for forecasting")
        except Exception as e:
            logger.warning(f"Prophet not available. Forecasting mocked. Error: {e}")

    def forecast_trends(self, dates: List[str], counts: List[int], periods: int = 7) -> dict:
        """Use Meta Prophet to forecast future issue reporting volumes."""
        if not self.prophet_loaded or len(dates) < 3:
            # Return mock linear forecast
            last_count = counts[-1] if counts else 0
            return {
                "forecast_dates": [f"2025-01-{str(i).zfill(2)}" for i in range(1, periods + 1)],
                "forecast_counts": [last_count + i for i in range(1, periods + 1)],
                "anomalies_detected": False
            }

        from prophet import Prophet
        
        df = pd.DataFrame({
            'ds': pd.to_datetime(dates),
            'y': counts
        })
        
        m = Prophet(daily_seasonality=True, yearly_seasonality=False)
        m.fit(df)
        
        future = m.make_future_dataframe(periods=periods)
        forecast = m.predict(future)
        
        # Get only the future predictions
        future_forecast = forecast.tail(periods)
        
        # Simple anomaly detection: if a recent actual point is wildly outside yhat_upper
        anomalies = False
        if len(df) > 0:
            last_actual = df.iloc[-1]
            last_pred = forecast[forecast['ds'] == last_actual['ds']].iloc[0]
            if last_actual['y'] > last_pred['yhat_upper'] * 1.5:
                anomalies = True

        return {
            "forecast_dates": future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "forecast_counts": future_forecast['yhat'].round(1).tolist(),
            "anomalies_detected": anomalies
        }

    def detect_hotspots(self, points: List[dict]) -> dict:
        """Use DBSCAN to cluster GPS coordinates into civic issue hotspots."""
        if not points:
            return {"clusters": [], "noise": []}

        try:
            from sklearn.cluster import DBSCAN
            
            # Extract coordinates
            coords = np.array([[p['lat'], p['lng']] for p in points])
            
            # DBSCAN parameters:
            # eps in radians (using Haversine metric). ~100 meters
            kms_per_radian = 6371.0088
            epsilon = (0.1) / kms_per_radian 
            
            db = DBSCAN(eps=epsilon, min_samples=2, algorithm='ball_tree', metric='haversine').fit(np.radians(coords))
            
            labels = db.labels_
            clusters = {}
            noise = []
            
            for idx, label in enumerate(labels):
                point_id = points[idx]['id']
                if label == -1:
                    noise.append(point_id)
                else:
                    if str(label) not in clusters:
                        clusters[str(label)] = []
                    clusters[str(label)].append(point_id)
                    
            return {
                "clusters": list(clusters.values()),
                "noise": noise
            }
        except Exception as e:
            logger.error(f"Clustering failed: {e}")
            # Fallback mock
            return {"clusters": [[p['id'] for p in points]], "noise": []}

    def score_priority(self, description: str, yolo_severity: float, cluster_density: int) -> dict:
        """Use NLP (spaCy) and heuristics (or Random Forest) to score issue priority."""
        nlp_score = 0.0
        
        if self.nlp:
            doc = self.nlp(description.lower())
            urgent_keywords = {"urgent", "danger", "hazardous", "blocked", "broken", "immediate", "child", "school"}
            tokens = {token.lemma_ for token in doc}
            matches = len(urgent_keywords.intersection(tokens))
            nlp_score = min(matches * 2.0, 10.0)
        else:
            if "urgent" in description.lower() or "danger" in description.lower():
                nlp_score = 8.0

        # Weighted priority calculation
        # In a full ML system, this would be a trained RandomForestClassifier(yolo_sev, nlp_score, density)
        priority_score = (yolo_severity * 0.5) + (nlp_score * 0.3) + (min(cluster_density, 5) * 0.2)
        
        if priority_score > 7.5:
            label = "CRITICAL"
        elif priority_score > 5.0:
            label = "HIGH"
        elif priority_score > 3.0:
            label = "MEDIUM"
        else:
            label = "LOW"

        return {
            "priority_score": round(priority_score, 2),
            "priority_label": label
        }

analytics_service = AnalyticsService()
