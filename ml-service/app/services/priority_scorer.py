import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import shap

class IssuePriorityScorer:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.explainer = None
        self.is_trained = False
        self.feature_names = ['severityScore', 'upvotes', 'locationRisk', 'issueAgeHours', 'weatherRisk', 'citizenImpact']
        
    def fit(self, X: pd.DataFrame, y: pd.Series):
        """
        Train the Random Forest model and initialize the SHAP explainer.
        X should contain the exact features in self.feature_names.
        """
        self.model.fit(X[self.feature_names], y)
        # TreeExplainer is heavily optimized for Random Forests
        self.explainer = shap.TreeExplainer(self.model)
        self.is_trained = True

    def predict(self, feature_dict: dict):
        """
        Predicts priority score (0-100) and returns SHAP explanation.
        """
        if not self.is_trained:
            # Fallback to a simple heuristic if not trained (e.g. cold start)
            score = (
                feature_dict.get('severityScore', 0) * 0.4 + 
                min(feature_dict.get('upvotes', 0) * 2, 20) + 
                feature_dict.get('locationRisk', 0) * 20 + 
                feature_dict.get('weatherRisk', 0) * 10
            )
            return {
                "priority_score": min(100, max(0, score)),
                "explanation": "Model not trained. Using fallback heuristic.",
                "shap_values": {}
            }

        # Convert input to DataFrame
        X_infer = pd.DataFrame([feature_dict])[self.feature_names]
        
        # Predict
        predicted_score = self.model.predict(X_infer)[0]
        predicted_score = min(100, max(0, predicted_score))
        
        # Explain using SHAP
        shap_values = self.explainer.shap_values(X_infer)[0]
        base_value = self.explainer.expected_value
        
        if isinstance(base_value, np.ndarray):
            base_value = base_value[0]
            
        shap_dict = {feat: float(val) for feat, val in zip(self.feature_names, shap_values)}
        
        # Generate a human-readable explanation from top SHAP values
        sorted_shap = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
        top_driver, top_val = sorted_shap[0]
        direction = "increasing" if top_val > 0 else "decreasing"
        
        explanation = f"Priority score is primarily driven by {top_driver} ({direction} score by {abs(top_val):.1f} pts)."
        
        return {
            "priority_score": round(predicted_score, 1),
            "explanation": explanation,
            "base_value": round(base_value, 1),
            "shap_values": {k: round(v, 2) for k, v in shap_dict.items()}
        }
