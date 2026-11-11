import os
import numpy as np
from PIL import Image

def preprocess_image(image_path: str, target_size=(224, 224)) -> np.ndarray:
    """
    Standardizes foliar pathology images:
    1. Loads RGB channels.
    2. Resizes to target resolution (224, 224).
    3. Normalizes pixel values into [0.0, 1.0].
    4. Applies ImageNet standardization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225].
    """
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(img, dtype=np.float32) / 255.0
    
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    normalized = (img_array - mean) / std
    return normalized

def augment_image(img: Image.Image) -> list[Image.Image]:
    """Data augmentation to simulate field lighting and camera orientation."""
    augmented = [img]
    augmented.append(img.transpose(Image.Transpose.FLIP_LEFT_RIGHT))
    augmented.append(img.rotate(15, fillcolor=(245, 247, 242)))
    augmented.append(img.rotate(-15, fillcolor=(245, 247, 242)))
    return augmented

