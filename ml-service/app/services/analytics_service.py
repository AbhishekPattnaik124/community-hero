"""
analytics_service.py — no spaCy/Prophet dependencies.
Uses numpy + sklearn + keyword matching for all analytics.
"""
import logging
import numpy as np
import pandas as pd
from typing import List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

URGENT_KEYWORDS = {
    "urgent", "danger", "hazardous", "blocked", "broken",
    "immediate", "child", "school", "critical", "flood",
    "collapse", "accident", "electrocution",
}


class AnalyticsService:
    def forecast_trends(self, dates: List[str], counts: List[int], periods: int = 7) -> dict:
        """Linear trend forecast using numpy polyfit."""
        if len(counts) < 2:
            last = counts[-1] if counts else 0
            base = datetime.today()
            return {
                "forecast_dates": [(base + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, periods + 1)],
                "forecast_counts": [round(last + i * 0.5, 1) for i in range(1, periods + 1)],
                "anomalies_detected": False,
            }

        x = np.arange(len(counts), dtype=float)
        y = np.array(counts, dtype=float)
        coeffs = np.polyfit(x, y, 1)
        slope, intercept = coeffs

        base = datetime.today()
        forecast_counts = []
        forecast_dates = []
        for i in range(1, periods + 1):
            fc = slope * (len(counts) + i) + intercept
            forecast_counts.append(round(max(0, fc), 1))
            forecast_dates.append((base + timedelta(days=i)).strftime('%Y-%m-%d'))

        # Simple anomaly: if the last count > 2x moving average
        ma = float(np.mean(y[-5:])) if len(y) >= 5 else float(np.mean(y))
        anomalies_detected = bool(y[-1] > ma * 2) if len(y) > 1 else False

        return {
            "forecast_dates": forecast_dates,
            "forecast_counts": forecast_counts,
            "anomalies_detected": anomalies_detected,
        }

    def detect_hotspots(self, points: List[dict]) -> dict:
        """DBSCAN clustering with haversine metric."""
        if not points:
            return {"clusters": [], "noise": []}
        try:
            from sklearn.cluster import DBSCAN
            coords = np.radians(np.array([[p['lat'], p['lng']] for p in points]))
            epsilon = 0.1 / 6371.0088  # ~100m in radians
            db = DBSCAN(eps=epsilon, min_samples=2, algorithm='ball_tree', metric='haversine').fit(coords)
            clusters: dict = {}
            noise = []
            for idx, label in enumerate(db.labels_):
                pid = points[idx].get('id', str(idx))
                if label == -1:
                    noise.append(pid)
                else:
                    clusters.setdefault(str(label), []).append(pid)
            return {"clusters": list(clusters.values()), "noise": noise}
        except Exception as e:
            logger.error(f"Clustering failed: {e}")
            return {"clusters": [[p.get('id', str(i)) for i, p in enumerate(points)]], "noise": []}

    def score_priority(self, description: str, yolo_severity: float, cluster_density: int) -> dict:
        """Keyword + heuristic priority scorer."""
        words = set(description.lower().split())
        matches = len(URGENT_KEYWORDS & words)
        nlp_score = min(matches * 2.0, 10.0)

        priority_score = (yolo_severity * 0.5) + (nlp_score * 0.3) + (min(cluster_density, 5) * 0.2)

        if priority_score > 7.5:
            label = "CRITICAL"
        elif priority_score > 5.0:
            label = "HIGH"
        elif priority_score > 3.0:
            label = "MEDIUM"
        else:
            label = "LOW"

        return {"priority_score": round(priority_score, 2), "priority_label": label}


analytics_service = AnalyticsService()
