import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
import numpy as np

class ResolutionTimePredictor:
    def __init__(self):
        # We predict log(hours) to handle skewness, but for simplicity let's stick to raw hours in GB
        self.model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
        self.is_trained = False
        
        # Categorical encoders
        self.category_encoder = LabelEncoder()
        self.zone_encoder = LabelEncoder()
        
        self.feature_names = ['category_encoded', 'zone_encoded', 'sla_performance_index', 'active_issues_load', 'severityScore']
        
    def fit(self, df: pd.DataFrame):
        """
        df must contain ['category', 'zone', 'sla_performance_index', 'active_issues_load', 'severityScore', 'hours_to_resolve']
        """
        if df.empty:
            return
            
        # Encode categoricals
        df['category_encoded'] = self.category_encoder.fit_transform(df['category'])
        df['zone_encoded'] = self.zone_encoder.fit_transform(df['zone'])
        
        X = df[self.feature_names]
        y = df['hours_to_resolve']
        
        self.model.fit(X, y)
        self.is_trained = True
        
    def predict(self, feature_dict: dict):
        """
        Predicts estimated time to resolve in hours.
        """
        if not self.is_trained:
            # Fallback heuristic based on severity and load
            base_hours = {
                'critical': 24,
                'high': 72,
                'medium': 168, # 1 week
                'low': 336 # 2 weeks
            }
            
            severity = "medium"
            score = feature_dict.get('severityScore', 50)
            if score >= 80: severity = "critical"
            elif score >= 60: severity = "high"
            elif score <= 30: severity = "low"
            
            load = feature_dict.get('active_issues_load', 1.0)
            est_hours = base_hours[severity] * (1.0 + (load * 0.1))
            
            return {
                "estimated_hours": round(est_hours, 1),
                "confidence": "Low (Untrained Fallback)"
            }

        # Handle unknown categories gracefully
        try:
            cat_enc = self.category_encoder.transform([feature_dict.get('category', 'other')])[0]
        except ValueError:
            cat_enc = -1
            
        try:
            zone_enc = self.zone_encoder.transform([feature_dict.get('zone', 'unknown')])[0]
        except ValueError:
            zone_enc = -1
            
        X_infer = pd.DataFrame([{
            'category_encoded': cat_enc,
            'zone_encoded': zone_enc,
            'sla_performance_index': feature_dict.get('sla_performance_index', 1.0),
            'active_issues_load': feature_dict.get('active_issues_load', 5.0),
            'severityScore': feature_dict.get('severityScore', 50)
        }])[self.feature_names]
        
        pred_hours = self.model.predict(X_infer)[0]
        pred_hours = max(1.0, pred_hours) # Minimum 1 hour
        
        return {
            "estimated_hours": round(pred_hours, 1),
            "confidence": "High (Gradient Boosting)"
        }
