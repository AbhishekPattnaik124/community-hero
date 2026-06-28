"""image_utils.py — no cv2 dependency."""
import base64
import io
import numpy as np
from PIL import Image


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


def pil_to_numpy(image: Image.Image) -> np.ndarray:
    """Convert PIL Image to numpy RGB array."""
    return np.array(image.convert("RGB"))


def numpy_to_pil(arr: np.ndarray) -> Image.Image:
    """Convert numpy RGB array to PIL Image."""
    return Image.fromarray(arr.astype(np.uint8))
