import geojson

class EngagementPredictor:
    def __init__(self):
        pass
        
    def find_underreported_zones(self, zone_metrics: list):
        """
        zone_metrics is a list of dicts:
        [
            {
                "zone_id": "ward_1",
                "population_density": 15000, # people per sq km
                "infrastructure_age_years": 40,
                "actual_reports_last_30d": 5,
                "boundary": [[lng, lat], ...] # polygon coordinates
            },
            ...
        ]
        """
        features = []
        for zone in zone_metrics:
            # Simple heuristic model for "expected" reports
            # Older infrastructure + higher population = more expected issues
            expected_reports = (zone.get('population_density', 1000) / 1000.0) * (zone.get('infrastructure_age_years', 10) / 10.0)
            
            actual = zone.get('actual_reports_last_30d', 0)
            
            # If actual reports are significantly lower than expected, it's a dark zone
            discrepancy_ratio = 0.0
            if expected_reports > 0:
                discrepancy_ratio = max(0, (expected_reports - actual) / expected_reports)
                
            is_dark_zone = discrepancy_ratio > 0.6 # 60% fewer reports than expected
            
            # Create GeoJSON feature
            boundary = zone.get('boundary', [])
            if not boundary:
                continue
                
            polygon = geojson.Polygon([boundary])
            feature = geojson.Feature(
                geometry=polygon,
                properties={
                    "zone_id": zone.get('zone_id'),
                    "expected_reports_30d": round(expected_reports, 1),
                    "actual_reports_30d": actual,
                    "discrepancy_ratio": round(discrepancy_ratio, 2),
                    "is_underreported": is_dark_zone,
                    "recommended_action": "Targeted Awareness Campaign" if is_dark_zone else "Monitoring Normal"
                }
            )
            features.append(feature)
            
        return geojson.FeatureCollection(features)
