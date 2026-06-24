import logging
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

class CivicVisionModel:
    def __init__(self, model_path: str = "yolov8n.pt"):
        self.model = None
        self.use_mock = False
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_path)
            logger.info(f"Loaded YOLO model from {model_path}")
        except Exception as e:
            logger.warning(f"Could not load real YOLO model, using mock fallback. Error: {e}")
            self.use_mock = True

    def detect(self, image: Image.Image):
        if self.use_mock or not self.model:
            # Return simulated detections for a civic issue
            return [
                {"label": "pothole", "confidence": 0.92, "bbox": [50, 50, 200, 200]}
            ]
        
        results = self.model(image)
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                detections.append({
                    "label": self.model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist()
                })
        return detections

class CLIPDuplicateDetector:
    def __init__(self):
        self.processor = None
        self.model = None
        self.use_mock = False
        try:
            from transformers import CLIPProcessor, CLIPModel
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            logger.info("Loaded CLIP model for duplicate detection")
        except Exception as e:
            logger.warning(f"Could not load CLIP model, using mock fallback. Error: {e}")
            self.use_mock = True

    def extract_embedding(self, image: Image.Image):
        if self.use_mock or not self.model:
            return np.random.rand(512).tolist()
            
        inputs = self.processor(images=image, return_tensors="pt")
        outputs = self.model.get_image_features(**inputs)
        return outputs.detach().numpy()[0].tolist()

vision_model = CivicVisionModel()
duplicate_detector = CLIPDuplicateDetector()
