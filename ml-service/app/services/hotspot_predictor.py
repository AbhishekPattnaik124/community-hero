"""
hotspot_predictor.py
Pure NumPy/scikit-learn DBSCAN hotspot predictor.
Prophet dependency removed — uses simple linear trend extrapolation instead.
"""
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
import geojson


class HotspotPredictor:
    def __init__(self, eps_km=0.5, min_samples=3):
        # eps in degrees (~111 km per degree of latitude)
        self.eps = eps_km / 111.0
        self.min_samples = min_samples
        self.clusters = []

    def fit_clusters(self, df: pd.DataFrame):
        """df must contain 'lat' and 'lng' columns."""
        if df.empty or len(df) < self.min_samples:
            return []

        coords = df[['lat', 'lng']].values
        db = DBSCAN(eps=self.eps, min_samples=self.min_samples, metric='euclidean').fit(coords)
        df = df.copy()
        df['cluster'] = db.labels_

        clusters_info = []
        for cluster_id in set(db.labels_):
            if cluster_id == -1:
                continue  # noise
            pts = df[df['cluster'] == cluster_id]
            clusters_info.append({
                'cluster_id': int(cluster_id),
                'centroid': (pts['lat'].mean(), pts['lng'].mean()),
                'point_count': len(pts),
                'points': pts[['lat', 'lng']].to_dict('records'),
            })

        self.clusters = clusters_info
        return clusters_info

    def _predict_future(self, point_count: int, horizon_days: int = 7) -> float:
        """Simple linear extrapolation: expect ~same density per week."""
        # Baseline: each past point contributes 0.1 future issues per day
        return round(point_count * 0.1 * horizon_days, 2)

    def generate_geojson(self, horizon_days: int = 7):
        """Returns a GeoJSON FeatureCollection of predicted hotspots."""
        features = []
        for cluster in self.clusters:
            future_volume = self._predict_future(cluster['point_count'], horizon_days)
            lat, lng = cluster['centroid']
            offset = self.eps

            polygon = geojson.Polygon([[
                (lng - offset, lat - offset),
                (lng + offset, lat - offset),
                (lng + offset, lat + offset),
                (lng - offset, lat + offset),
                (lng - offset, lat - offset),
            ]])

            confidence = min(100.0, cluster['point_count'] * 0.5 + future_volume * 2.0)

            feature = geojson.Feature(
                geometry=polygon,
                properties={
                    "cluster_id": cluster['cluster_id'],
                    "historical_count": cluster['point_count'],
                    "predicted_new_issues_7d": future_volume,
                    "confidence_score": round(confidence, 1),
                    "risk_level": "High" if confidence > 75 else "Medium" if confidence > 40 else "Low",
                },
            )
            features.append(feature)

        return geojson.FeatureCollection(features)
