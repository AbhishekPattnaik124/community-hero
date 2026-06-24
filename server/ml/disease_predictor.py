import json
import random
import sys

# ==========================================
# Disease Outbreak Early Warning Predictor
# ==========================================

def predict_outbreak_risk(stagnant_water_density, historical_cases):
    """
    Simulates predicting Dengue/Malaria outbreak risk using NVBDCP data logic.
    """
    print(f"Analyzing {stagnant_water_density} water stagnation reports against {historical_cases} historical cases...")
    
    # Base risk derived from historical endemicity
    base_risk = min(50, historical_cases * 2)
    
    # Amplifier based on recent stagnant water reports
    water_multiplier = stagnant_water_density * 5
    
    # Calculate final probability
    risk_score = min(100, base_risk + water_multiplier)
    
    # Outbreak threshold
    is_outbreak_warning = risk_score > 75
    
    return {
        "outbreakRiskScore": risk_score,
        "isWarning": is_outbreak_warning,
        "primaryVector": "Aedes Aegypti (Dengue)" if risk_score > 60 else "Anopheles (Malaria)"
    }

if __name__ == "__main__":
    # In a real environment, args would be passed in
    density = int(sys.argv[1]) if len(sys.argv) > 1 else random.randint(1, 10)
    history = int(sys.argv[2]) if len(sys.argv) > 2 else random.randint(5, 20)
    
    result = predict_outbreak_risk(density, history)
    print(json.dumps(result))
