import numpy as np
import xgboost as xgb
import shap
import json
import sys
from datetime import datetime

# ==========================================
# Anti-Fraud Citizen Verification ML Model
# Demonstrates training on synthetic civic data
# ==========================================

def train_model():
    print("Training XGBoost Fraud Model on civic dataset...")
    
    # Feature matrix: [account_age_days, fake_reports_history, distance_meters, has_phone_verified, is_night_time]
    # Synthetic labels: 1 (Fraud), 0 (Legit)
    X_train = np.array([
        [300, 0, 10, 1, 0],   # Legit
        [2, 0, 800, 0, 1],    # Fraud (New, far, unverified, night)
        [50, 2, 50, 1, 0],    # Fraud (History of fakes)
        [100, 0, 400, 1, 0],  # Legit
        [1, 0, 50, 0, 0],     # Unsure (New, unverified, but close) -> 0
        [400, 3, 2000, 0, 1], # Heavy Fraud
    ])
    y_train = np.array([0, 1, 1, 0, 0, 1])

    # Train XGBoost
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    # Save model (simulated)
    print("Model trained and saved to 'fraud_xgb.json'")
    return model

def infer(model, features):
    # features shape: [1, 5]
    prob = model.predict_proba(features)[0][1] # Probability of Class 1 (Fraud)
    score = int(prob * 100)
    
    # Generate SHAP explanations
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features)
    
    return score, shap_values

if __name__ == "__main__":
    model = train_model()
    
    # Test Inference
    test_case = np.array([[2, 0, 800, 0, 1]])
    score, shap_val = infer(model, test_case)
    
    print(f"\n--- Inference Result ---")
    print(f"Fraud Score: {score}/100")
    print(f"SHAP Values: {shap_val}")
    print(f"Action: {'FLAG FOR REVIEW' if score >= 70 else 'APPROVE'}")
