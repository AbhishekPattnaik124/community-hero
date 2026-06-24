from PIL import Image
import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim
from app.models.ml_models import vision_model, duplicate_detector
from app.services.gemini_service import gemini_service
from app.utils.image_utils import pil_to_cv2, cv2_to_pil
import logging

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        pass

    async def analyze_image(self, image: Image.Image, location: str = None, weather: str = None):
        """Run YOLO detection, severity scoring, and Gemini reasoning."""
        # 1. Object Detection (YOLO)
        detections = vision_model.detect(image)
        
        # 2. Heuristic Severity Scoring based on detections
        # In a full system, this would pass the image crop to a CNN regressor.
        severity_score = self._calculate_severity(detections)

        # 3. Gemini CoT Analysis
        gemini_analysis = await gemini_service.analyze_civic_issue(image, location, weather)

        # 4. Auto-crop to highest confidence detection
        cropped_image = None
        if detections:
            best_det = max(detections, key=lambda x: x['confidence'])
            cropped_image = self._auto_crop(image, best_det['bbox'])

        return {
            "detections": detections,
            "severity_score": severity_score,
            "gemini_analysis": gemini_analysis,
            "cropped_image": cropped_image
        }

    def check_duplicate(self, target_image: Image.Image, recent_images: list[Image.Image]) -> dict:
        """Use CLIP embeddings to find duplicate images."""
        target_emb = duplicate_detector.extract_embedding(target_image)
        
        best_score = -1.0
        match_index = None

        for idx, img in enumerate(recent_images):
            emb = duplicate_detector.extract_embedding(img)
            # Cosine similarity
            score = np.dot(target_emb, emb) / (np.linalg.norm(target_emb) * np.linalg.norm(emb))
            if score > best_score:
                best_score = float(score)
                match_index = idx

        # Threshold for duplicate (e.g., > 0.85 similarity)
        is_duplicate = best_score > 0.85

        return {
            "is_duplicate": is_duplicate,
            "similarity_score": best_score,
            "match_index": match_index if is_duplicate else None
        }

    def compare_before_after(self, before_img: Image.Image, after_img: Image.Image) -> dict:
        """Use SSIM to compare before and after resolution images."""
        try:
            # Convert to cv2 grayscale
            before_cv = cv2.cvtColor(pil_to_cv2(before_img), cv2.COLOR_BGR2GRAY)
            after_cv = cv2.cvtColor(pil_to_cv2(after_img), cv2.COLOR_BGR2GRAY)
            
            # Resize after_img to match before_img dimensions
            after_cv = cv2.resize(after_cv, (before_cv.shape[1], before_cv.shape[0]))
            
            # Compute SSIM
            score, diff = ssim(before_cv, after_cv, full=True)
            
            return {
                "similarity_score": float(score),
                "is_resolved": score < 0.6  # High difference implies significant change/resolution
            }
        except Exception as e:
            logger.error(f"SSIM comparison failed: {e}")
            return {"similarity_score": 0.0, "is_resolved": False}

    def _calculate_severity(self, detections) -> float:
        if not detections:
            return 1.0
        # Simple heuristic: higher confidence + certain labels = higher severity
        high_severity_labels = ["pothole", "fallen_tree", "broken_streetlight", "flooding"]
        max_severity = 1.0
        for d in detections:
            base = 5.0 if d["label"] in high_severity_labels else 2.0
            score = base + (d["confidence"] * 5.0)
            max_severity = max(max_severity, min(score, 10.0))
        return round(max_severity, 1)

    def _auto_crop(self, image: Image.Image, bbox: list) -> Image.Image:
        try:
            x1, y1, x2, y2 = map(int, bbox)
            # Add padding
            pad = 20
            w, h = image.size
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(w, x2 + pad)
            y2 = min(h, y2 + pad)
            return image.crop((x1, y1, x2, y2))
        except Exception as e:
            logger.error(f"Crop failed: {e}")
            return None

vision_service = VisionService()
