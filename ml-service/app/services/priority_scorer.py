"""
priority_scorer.py
Random Forest priority scorer — SHAP removed (was heavy dep).
Uses feature-importance weights instead for explainability.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor


class IssuePriorityScorer:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.is_trained = False
        self.feature_names = [
            'severityScore', 'upvotes', 'locationRisk',
            'issueAgeHours', 'weatherRisk', 'citizenImpact',
        ]

    def fit(self, X: pd.DataFrame, y):
        self.model.fit(X[self.feature_names], y)
        self.is_trained = True

    def predict(self, feature_dict: dict):
        if not self.is_trained:
            score = (
                feature_dict.get('severityScore', 0) * 0.4
                + min(feature_dict.get('upvotes', 0) * 2, 20)
                + feature_dict.get('locationRisk', 0) * 20
                + feature_dict.get('weatherRisk', 0) * 10
            )
            return {
                "priority_score": min(100, max(0, round(score, 1))),
                "explanation": "Heuristic fallback (model not yet trained).",
                "feature_importance": {},
            }

        X_inf = pd.DataFrame([feature_dict])[self.feature_names]
        predicted_score = float(np.clip(self.model.predict(X_inf)[0], 0, 100))

        importances = dict(zip(self.feature_names, self.model.feature_importances_))
        top = max(importances, key=importances.get)

        return {
            "priority_score": round(predicted_score, 1),
            "explanation": f"Top driver: {top} ({importances[top]:.0%} importance).",
            "feature_importance": {k: round(float(v), 3) for k, v in importances.items()},
        }
