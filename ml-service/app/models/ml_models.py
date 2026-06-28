"""
ml_models.py
Lightweight civic vision model — no YOLO/CLIP heavy deps.
Uses Pillow + numpy for basic image analysis with Gemini as the AI backbone.
"""
import logging
import numpy as np
from PIL import Image, ImageFilter, ImageStat

logger = logging.getLogger(__name__)


class CivicVisionModel:
    """
    Lightweight image analyser using only Pillow + numpy.
    Analyses brightness, contrast, and colour distribution as signals
    for civic issue severity, then defers to Gemini for semantic understanding.
    """

    CIVIC_CATEGORIES = [
        "pothole", "waterlogging", "streetlight",
        "garbage", "construction", "pollution", "other",
    ]

    def detect(self, image: Image.Image):
        """
        Returns a list of pseudo-detections derived from image statistics.
        In production the Gemini vision call in gemini_service supersedes this.
        """
        try:
            img_rgb = image.convert("RGB")
            stat = ImageStat.Stat(img_rgb)
            mean_brightness = sum(stat.mean) / 3

            # Dark image → likely nighttime streetlight issue
            if mean_brightness < 60:
                return [{"label": "streetlight", "confidence": 0.78, "bbox": [0, 0, image.width, image.height]}]

            # High red channel → possible warning/damage
            r, g, b = stat.mean
            if r > g + 30 and r > b + 30:
                return [{"label": "pothole", "confidence": 0.72, "bbox": [0, 0, image.width, image.height]}]

            # Default: return generic civic issue detection
            return [{"label": "civic_issue", "confidence": 0.65, "bbox": [0, 0, image.width, image.height]}]
        except Exception as e:
            logger.error(f"Image detection error: {e}")
            return [{"label": "civic_issue", "confidence": 0.50, "bbox": [0, 0, 100, 100]}]


class SimpleDuplicateDetector:
    """Pixel-hash based duplicate detector (no CLIP/transformers needed)."""

    def extract_embedding(self, image: Image.Image):
        """Returns a 64-dim normalised histogram as an embedding vector."""
        try:
            small = image.convert("L").resize((8, 8), Image.LANCZOS)
            arr = np.array(small, dtype=float).flatten()
            norm = np.linalg.norm(arr)
            return (arr / norm if norm > 0 else arr).tolist()
        except Exception:
            return [0.0] * 64


vision_model = CivicVisionModel()
duplicate_detector = SimpleDuplicateDetector()
