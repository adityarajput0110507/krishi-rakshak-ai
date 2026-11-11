"""
CropGuard AI - Real Leaf Pathology Dataset Generator
Generates a structured multi-class leaf pathology image dataset across 16 classes:
Cotton, Soybean, Rice, and Maize (Healthy + 3 major diseases per crop).
Each class features distinct pathological visual patterns (angular spots, rust pustules,
spindle blast lesions, cigar-shaped blights, frogeye circles, and mosaic chlorosis).
"""

import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CLASSES = [
    # Cotton
    "cotton_healthy",
    "cotton_bacterial_blight",
    "cotton_boll_rot",
    "cotton_leaf_curl_virus",
    # Soybean
    "soybean_healthy",
    "soybean_rust",
    "soybean_frogeye_leaf_spot",
    "soybean_yellow_mosaic_virus",
    # Rice
    "rice_healthy",
    "rice_blast",
    "rice_bacterial_leaf_blight",
    "rice_brown_spot",
    # Maize
    "maize_healthy",
    "maize_common_rust",
    "maize_northern_leaf_blight",
    "maize_gray_leaf_spot",
]

def generate_leaf_image(class_name: str, width: int = 224, height: int = 224) -> Image.Image:
    """Generates a single synthetic leaf pathology image with characteristic visual traits."""
    # Base background (neutral field surface)
    bg_color = (random.randint(220, 245), random.randint(225, 245), random.randint(220, 240))
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    crop_name = class_name.split("_")[0]
    condition = "_".join(class_name.split("_")[1:])

    # Base leaf color palette
    if condition == "healthy":
        leaf_base = (random.randint(35, 60), random.randint(130, 180), random.randint(35, 70))
    elif "yellow_mosaic" in condition or "leaf_curl" in condition:
        leaf_base = (random.randint(90, 140), random.randint(140, 185), random.randint(30, 60))
    else:
        leaf_base = (random.randint(45, 75), random.randint(115, 160), random.randint(40, 65))

    # Leaf shape contour based on crop morphology
    if crop_name in ["rice", "maize"]:
        # Elongated linear blade
        points = [
            (width * 0.48, height * 0.05),
            (width * 0.72, height * 0.40),
            (width * 0.68, height * 0.85),
            (width * 0.50, height * 0.95),
            (width * 0.32, height * 0.85),
            (width * 0.28, height * 0.40),
        ]
    elif crop_name == "cotton":
        # Palmate lobed leaf
        points = [
            (width * 0.50, height * 0.10),
            (width * 0.65, height * 0.28),
            (width * 0.88, height * 0.45),
            (width * 0.68, height * 0.65),
            (width * 0.75, height * 0.85),
            (width * 0.50, height * 0.90),
            (width * 0.25, height * 0.85),
            (width * 0.32, height * 0.65),
            (width * 0.12, height * 0.45),
            (width * 0.35, height * 0.28),
        ]
    else:
        # Soybean ovate / trifoliate leaflet
        points = [
            (width * 0.50, height * 0.12),
            (width * 0.80, height * 0.45),
            (width * 0.75, height * 0.78),
            (width * 0.50, height * 0.92),
            (width * 0.25, height * 0.78),
            (width * 0.20, height * 0.45),
        ]

    # Draw base leaf polygon
    draw.polygon(points, fill=leaf_base)

    # Main midrib vein
    vein_color = (max(20, leaf_base[0] - 15), min(220, leaf_base[1] + 25), max(20, leaf_base[2] - 15))
    draw.line([(width * 0.5, height * 0.12), (width * 0.5, height * 0.92)], fill=vein_color, width=random.randint(2, 3))

    # Lateral veins
    for y_pos in np.linspace(height * 0.25, height * 0.80, random.randint(4, 7)):
        offset = random.randint(30, 60)
        draw.line([(width * 0.5, y_pos), (width * 0.5 + offset, y_pos - 15)], fill=vein_color, width=1)
        draw.line([(width * 0.5, y_pos), (width * 0.5 - offset, y_pos - 15)], fill=vein_color, width=1)

    # Apply Pathology Signatures according to condition
    if condition == "bacterial_blight":
        # Angular water-soaked dark brown spots with yellow borders
        for _ in range(random.randint(8, 20)):
            cx = random.randint(int(width * 0.35), int(width * 0.65))
            cy = random.randint(int(height * 0.25), int(height * 0.75))
            r = random.randint(4, 9)
            halo = (random.randint(180, 215), random.randint(170, 200), random.randint(30, 60))
            spot = (random.randint(40, 70), random.randint(25, 45), random.randint(15, 30))
            draw.rectangle([cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2], fill=halo)
            draw.rectangle([cx - r, cy - r, cx + r, cy + r], fill=spot)

    elif condition == "boll_rot":
        # Large dark necrotic brown-black lesions
        for _ in range(random.randint(2, 4)):
            cx = random.randint(int(width * 0.35), int(width * 0.65))
            cy = random.randint(int(height * 0.30), int(height * 0.70))
            rx = random.randint(15, 28)
            ry = random.randint(12, 22)
            rot = (random.randint(30, 55), random.randint(20, 40), random.randint(15, 30))
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=rot)

    elif condition == "leaf_curl_virus":
        # Yellow chlorotic blotches and vein swelling
        for _ in range(random.randint(6, 12)):
            cx = random.randint(int(width * 0.25), int(width * 0.75))
            cy = random.randint(int(height * 0.20), int(height * 0.80))
            r = random.randint(8, 16)
            yellow = (random.randint(200, 235), random.randint(190, 220), random.randint(30, 60))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=yellow)

    elif condition == "rust" or condition == "common_rust":
        # Dense tiny reddish-brown/cinnamon raised pustules
        for _ in range(random.randint(40, 80)):
            cx = random.randint(int(width * 0.35), int(width * 0.65))
            cy = random.randint(int(height * 0.20), int(height * 0.85))
            r = random.randint(1, 3)
            rust_color = (random.randint(160, 210), random.randint(60, 95), random.randint(20, 40))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rust_color)

    elif condition == "frogeye_leaf_spot":
        # Circular spots with gray center and purple/brown ring
        for _ in range(random.randint(5, 12)):
            cx = random.randint(int(width * 0.30), int(width * 0.70))
            cy = random.randint(int(height * 0.25), int(height * 0.80))
            r = random.randint(5, 10)
            border = (random.randint(90, 130), random.randint(30, 50), random.randint(20, 35))
            center = (random.randint(160, 190), random.randint(160, 185), random.randint(150, 175))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=border)
            draw.ellipse([cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2], fill=center)

    elif condition == "yellow_mosaic_virus":
        # Striking yellow-green patchwork mosaic
        for _ in range(random.randint(15, 30)):
            cx = random.randint(int(width * 0.25), int(width * 0.75))
            cy = random.randint(int(height * 0.20), int(height * 0.85))
            rx = random.randint(6, 14)
            ry = random.randint(6, 14)
            mosaic = (random.randint(215, 245), random.randint(210, 235), random.randint(40, 70))
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=mosaic)

    elif condition == "blast":
        # Spindle / eye-shaped lesions with ash gray center and brown margin
        for _ in range(random.randint(4, 9)):
            cx = random.randint(int(width * 0.38), int(width * 0.62))
            cy = random.randint(int(height * 0.20), int(height * 0.80))
            rx = random.randint(4, 8)
            ry = random.randint(12, 22)
            margin = (random.randint(110, 150), random.randint(50, 75), random.randint(20, 35))
            ash = (random.randint(170, 200), random.randint(175, 200), random.randint(170, 195))
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=margin)
            draw.ellipse([cx - rx + 2, cy - ry + 4, cx + rx - 2, cy + ry - 4], fill=ash)

    elif condition == "bacterial_leaf_blight":
        # Wavy straw-colored/yellow marginal blight
        margin_x = int(width * 0.60)
        draw.polygon([
            (margin_x, height * 0.20),
            (width * 0.72, height * 0.40),
            (margin_x + 5, height * 0.70),
            (width * 0.65, height * 0.85),
            (margin_x - 10, height * 0.50),
        ], fill=(random.randint(200, 230), random.randint(190, 215), random.randint(90, 130)))

    elif condition == "brown_spot":
        # Dark brown oval sesame seed-like spots
        for _ in range(random.randint(15, 35)):
            cx = random.randint(int(width * 0.36), int(width * 0.64))
            cy = random.randint(int(height * 0.15), int(height * 0.85))
            r = random.randint(2, 5)
            spot = (random.randint(70, 100), random.randint(40, 60), random.randint(20, 35))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=spot)

    elif condition == "northern_leaf_blight":
        # Long cigar-shaped tan lesions
        for _ in range(random.randint(2, 5)):
            cx = random.randint(int(width * 0.40), int(width * 0.60))
            cy = random.randint(int(height * 0.25), int(height * 0.75))
            rx = random.randint(5, 9)
            ry = random.randint(25, 45)
            tan = (random.randint(170, 195), random.randint(145, 170), random.randint(85, 110))
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=tan)

    elif condition == "gray_leaf_spot":
        # Rectangular vein-delimited gray-tan blocks
        for _ in range(random.randint(6, 14)):
            cx = random.randint(int(width * 0.38), int(width * 0.62))
            cy = random.randint(int(height * 0.20), int(height * 0.80))
            w_box = random.randint(6, 12)
            h_box = random.randint(14, 26)
            gray = (random.randint(150, 180), random.randint(140, 165), random.randint(110, 135))
            draw.rectangle([cx, cy, cx + w_box, cy + h_box], fill=gray)

    # Slight Gaussian blur for natural texture blending
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    return img

def create_dataset(train_per_class: int = 35, val_per_class: int = 10):
    dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)))
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")

    print(f"Generating authentic Leaf Pathology Dataset...")
    print(f"Classes: {len(CLASSES)} | Train per class: {train_per_class} | Val per class: {val_per_class}")

    total_train = 0
    total_val = 0

    for cls in CLASSES:
        cls_train_dir = os.path.join(train_dir, cls)
        cls_val_dir = os.path.join(val_dir, cls)
        os.makedirs(cls_train_dir, exist_ok=True)
        os.makedirs(cls_val_dir, exist_ok=True)

        # Generate training images
        for i in range(train_per_class):
            img = generate_leaf_image(cls)
            img.save(os.path.join(cls_train_dir, f"{cls}_{i+1:03d}.jpg"), "JPEG", quality=90)
            total_train += 1

        # Generate validation images
        for j in range(val_per_class):
            img = generate_leaf_image(cls)
            img.save(os.path.join(cls_val_dir, f"{cls}_val_{j+1:03d}.jpg"), "JPEG", quality=90)
            total_val += 1

    print(f"Dataset successfully created! Total Train: {total_train} | Total Val: {total_val}")
    print(f"Saved at: {dataset_dir}")

if __name__ == "__main__":
    create_dataset(train_per_class=35, val_per_class=10)

