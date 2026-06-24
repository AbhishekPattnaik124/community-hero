import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from prophet import Prophet
import geojson

class HotspotPredictor:
    def __init__(self, eps_km=0.5, min_samples=5):
        # eps parameter for DBSCAN (converted roughly to degrees for lat/lng)
        # 1 degree of latitude is ~111km. So eps_km / 111 gives an approximation.
        self.eps = eps_km / 111.0
        self.min_samples = min_samples
        self.clusters = []
        
    def fit_clusters(self, df: pd.DataFrame):
        """
        df must contain 'lat' and 'lng' columns
        """
        if df.empty or len(df) < self.min_samples:
            return []
            
        coords = df[['lat', 'lng']].values
        
        # Use haversine metric if needed, but for small city scale, euclidean on degrees is often a decent approximation for quick DBSCAN
        db = DBSCAN(eps=self.eps, min_samples=self.min_samples, metric='euclidean').fit(coords)
        
        df['cluster'] = db.labels_
        
        # Extract cluster centroids and boundaries
        clusters_info = []
        for cluster_id in set(db.labels_):
            if cluster_id == -1:
                continue # Noise
                
            cluster_points = df[df['cluster'] == cluster_id]
            centroid_lat = cluster_points['lat'].mean()
            centroid_lng = cluster_points['lng'].mean()
            
            clusters_info.append({
                'cluster_id': int(cluster_id),
                'centroid': (centroid_lat, centroid_lng),
                'point_count': len(cluster_points),
                'points': cluster_points[['lat', 'lng', 'ds']].to_dict('records') # include timestamp 'ds' for prophet
            })
            
        self.clusters = clusters_info
        return clusters_info

    def predict_future_emergence(self, cluster_data, horizon_days=7):
        """
        Runs Prophet on a specific cluster's time series to predict future volume.
        """
        df = pd.DataFrame(cluster_data['points'])
        if df.empty or len(df) < 3:
            return 0.0 # Not enough data to forecast
            
        # Group by date to get daily counts
        df['ds'] = pd.to_datetime(df['ds']).dt.date
        daily_counts = df.groupby('ds').size().reset_index(name='y')
        
        # Fit Prophet
        m = Prophet(daily_seasonality=False, yearly_seasonality=False)
        m.fit(daily_counts)
        
        # Predict future
        future = m.make_future_dataframe(periods=horizon_days)
        forecast = m.predict(future)
        
        # Sum the forecasted volume over the horizon
        predicted_volume = forecast['yhat'].tail(horizon_days).sum()
        return max(0, predicted_volume)

    def generate_geojson(self, horizon_days=7):
        """
        Returns a GeoJSON FeatureCollection of predicted hotspots with confidence scores.
        """
        features = []
        for cluster in self.clusters:
            future_volume = self.predict_future_emergence(cluster, horizon_days)
            
            # Create a simple Polygon around the centroid (e.g., a square bounding box based on eps)
            lat, lng = cluster['centroid']
            offset = self.eps
            polygon = geojson.Polygon([[
                (lng - offset, lat - offset),
                (lng + offset, lat - offset),
                (lng + offset, lat + offset),
                (lng - offset, lat + offset),
                (lng - offset, lat - offset)
            ]])
            
            # Confidence score heuristic based on past density + future slope
            confidence = min(100, (cluster['point_count'] * 0.5) + (future_volume * 2.0))
            
            feature = geojson.Feature(
                geometry=polygon,
                properties={
                    "cluster_id": cluster['cluster_id'],
                    "historical_count": cluster['point_count'],
                    "predicted_new_issues_7d": round(future_volume, 2),
                    "confidence_score": round(confidence, 1),
                    "risk_level": "High" if confidence > 75 else "Medium" if confidence > 40 else "Low"
                }
            )
            features.append(feature)
            
        return geojson.FeatureCollection(features)
