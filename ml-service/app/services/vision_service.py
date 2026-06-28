"""
vision_service.py — lightweight, no cv2/skimage required.
Uses Pillow + numpy + Gemini for civic issue analysis.
"""
import numpy as np
import logging
from PIL import Image

from app.models.ml_models import vision_model, duplicate_detector
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)


class VisionService:
    async def analyze_image(self, image: Image.Image, location: str = None, weather: str = None):
        """Run image detection + Gemini semantic reasoning."""
        detections = vision_model.detect(image)
        severity_score = self._calculate_severity(detections)
        gemini_analysis = await gemini_service.analyze_civic_issue(image, location, weather)

        return {
            "detections": detections,
            "severity_score": severity_score,
            "gemini_analysis": gemini_analysis,
            "cropped_image": None,  # no crop needed without cv2
        }

    def check_duplicate(self, target_image: Image.Image, recent_images: list):
        """Cosine-similarity duplicate check using pixel-hash embeddings."""
        target_emb = np.array(duplicate_detector.extract_embedding(target_image))
        best_score = -1.0
        match_index = None

        for idx, img in enumerate(recent_images):
            emb = np.array(duplicate_detector.extract_embedding(img))
            norm = np.linalg.norm(target_emb) * np.linalg.norm(emb)
            score = float(np.dot(target_emb, emb) / norm) if norm > 0 else 0.0
            if score > best_score:
                best_score = score
                match_index = idx

        return {
            "is_duplicate": best_score > 0.90,
            "similarity_score": round(best_score, 3),
            "match_index": match_index if best_score > 0.90 else None,
        }

    def compare_before_after(self, before_img: Image.Image, after_img: Image.Image) -> dict:
        """Pixel-level comparison using mean absolute difference."""
        try:
            b = np.array(before_img.convert("L").resize((64, 64)), dtype=float)
            a = np.array(after_img.convert("L").resize((64, 64)), dtype=float)
            mad = float(np.mean(np.abs(b - a)))
            score = max(0.0, 1.0 - mad / 255.0)
            return {"similarity_score": round(score, 3), "is_resolved": score < 0.6}
        except Exception as e:
            logger.error(f"Before/after comparison failed: {e}")
            return {"similarity_score": 0.0, "is_resolved": False}

    def _calculate_severity(self, detections) -> float:
        if not detections:
            return 1.0
        HIGH = {"pothole", "fallen_tree", "broken_streetlight", "flooding"}
        max_s = 1.0
        for d in detections:
            base = 5.0 if d.get("label") in HIGH else 2.0
            max_s = max(max_s, min(base + d.get("confidence", 0.5) * 5.0, 10.0))
        return round(max_s, 1)


vision_service = VisionService()
