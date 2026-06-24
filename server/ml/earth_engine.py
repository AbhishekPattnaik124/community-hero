import json
import random
import sys

# ==========================================
# Google Earth Engine / NASA MODIS Integrator
# ==========================================

def analyze_urban_heat_and_greenery(lat, lng):
    """
    Simulates fetching NDVI and Surface Temperature from GEE without requiring auth keys.
    """
    print(f"Fetching NASA MODIS and GEE NDVI data for coordinates: {lat}, {lng}...")
    
    # Mock NDVI (Normalized Difference Vegetation Index)
    # Range: -1 to +1. >0.2 indicates vegetation.
    mock_ndvi = round(random.uniform(0.05, 0.4), 3)
    
    # Mock Surface Temperature (Celsius)
    mock_temp = round(random.uniform(35.0, 45.0), 1)
    
    is_heat_island = mock_temp > 40.0 and mock_ndvi < 0.15
    
    return {
        "ndvi": mock_ndvi,
        "surfaceTemperatureC": mock_temp,
        "isUrbanHeatIsland": is_heat_island,
        "suggestion": "Recommend planting 15 local shade trees (e.g. Neem, Banyan) in this 50m radius." if is_heat_island else "Green cover is currently adequate."
    }

if __name__ == "__main__":
    lat = float(sys.argv[1]) if len(sys.argv) > 1 else 22.5726
    lng = float(sys.argv[2]) if len(sys.argv) > 2 else 88.3639
    
    result = analyze_urban_heat_and_greenery(lat, lng)
    print(json.dumps(result))
