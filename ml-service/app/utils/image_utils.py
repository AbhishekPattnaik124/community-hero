import base64
import io
from PIL import Image
import numpy as np
import cv2

def decode_base64_image(base64_str: str) -> Image.Image:
    """Decode base64 string to PIL Image."""
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    image_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_data)).convert('RGB')

def encode_image_base64(image: Image.Image) -> str:
    """Encode PIL Image to base64 string."""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")

def pil_to_cv2(image: Image.Image) -> np.ndarray:
    """Convert PIL Image to OpenCV format."""
    open_cv_image = np.array(image)
    return open_cv_image[:, :, ::-1].copy()

def cv2_to_pil(image: np.ndarray) -> Image.Image:
    """Convert OpenCV Image to PIL format."""
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return Image.fromarray(image_rgb)
