import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "static", "samples")
os.makedirs(samples_dir, exist_ok=True)

def create_leaf_base(width=600, height=600, base_color=(54, 114, 62)):
    # Create smooth organic leaf texture
    img = Image.new("RGB", (width, height), (245, 247, 242))
    draw = ImageDraw.Draw(img)
    
    # Leaf contour points (elliptical organic lanceolate/ovate shape)
    cx, cy = width // 2, height // 2
    draw.polygon([
        (cx, cy - 250),
        (cx + 180, cy - 80),
        (cx + 200, cy + 90),
        (cx + 80, cy + 220),
        (cx, cy + 260),
        (cx - 80, cy + 220),
        (cx - 200, cy + 90),
        (cx - 180, cy - 80),
    ], fill=base_color)

    # Main vein
    draw.line([(cx, cy - 240), (cx, cy + 250)], fill=(78, 142, 85), width=6)
    # Lateral secondary veins
    for i in range(-180, 200, 50):
        y_pos = cy + i
        draw.line([(cx, y_pos), (cx + 140, y_pos + 60)], fill=(72, 134, 79), width=3)
        draw.line([(cx, y_pos), (cx - 140, y_pos + 60)], fill=(72, 134, 79), width=3)

    return img

def create_cotton_bacterial_blight():
    img = create_leaf_base(base_color=(50, 110, 58))
    draw = ImageDraw.Draw(img)
    # Angular dark brown water-soaked lesions bounded by veins
    np.random.seed(101)
    for _ in range(35):
        rx = np.random.randint(180, 420)
        ry = np.random.randint(150, 450)
        size = np.random.randint(8, 22)
        # Angular polygons
        draw.polygon([
            (rx, ry),
            (rx + size, ry + 4),
            (rx + size + 6, ry + size),
            (rx - 2, ry + size + 3)
        ], fill=(120, 68, 32))
        # Inner greasy center
        draw.ellipse([rx+2, ry+2, rx+size-2, ry+size-2], fill=(74, 38, 18))
    img.save(os.path.join(samples_dir, "cotton_bacterial_blight.jpg"), quality=92)

def create_cotton_leaf_curl():
    img = create_leaf_base(base_color=(118, 155, 65))
    draw = ImageDraw.Draw(img)
    # Thickened yellow-green primary and secondary veins and leaf edge curling
    for y in range(120, 480, 35):
        draw.line([(300, y), (440, y + 40)], fill=(188, 200, 75), width=8)
        draw.line([(300, y), (160, y + 40)], fill=(188, 200, 75), width=8)
    draw.line([(300, 60), (300, 550)], fill=(198, 212, 85), width=12)
    img.save(os.path.join(samples_dir, "cotton_leaf_curl.jpg"), quality=92)

def create_soybean_rust():
    img = create_leaf_base(base_color=(68, 122, 60))
    draw = ImageDraw.Draw(img)
    # Dense reddish-brown uredinial pustules
    np.random.seed(202)
    for _ in range(140):
        rx = np.random.randint(160, 440)
        ry = np.random.randint(140, 480)
        r = np.random.randint(3, 7)
        # Chlorotic halo
        draw.ellipse([rx-r-2, ry-r-2, rx+r+2, ry+r+2], fill=(165, 145, 52))
        # Rust pustule
        draw.ellipse([rx-r, ry-r, rx+r, ry+r], fill=(145, 62, 28))
    img.save(os.path.join(samples_dir, "soybean_rust.jpg"), quality=92)

def create_rice_blast():
    img = create_leaf_base(base_color=(58, 128, 65))
    draw = ImageDraw.Draw(img)
    # Characteristic spindle-shaped elliptical lesions with gray centers and brown borders
    lesion_positions = [(250, 200), (350, 280), (280, 350), (320, 180), (260, 420), (340, 410)]
    for lx, ly in lesion_positions:
        # Outer brown spindle
        draw.polygon([
            (lx, ly - 35), (lx + 14, ly), (lx, ly + 35), (lx - 14, ly)
        ], fill=(132, 65, 30))
        # Inner grayish-white center
        draw.polygon([
            (lx, ly - 22), (lx + 8, ly), (lx, ly + 22), (lx - 8, ly)
        ], fill=(198, 195, 188))
    img.save(os.path.join(samples_dir, "rice_blast.jpg"), quality=92)

def create_maize_leaf_blight():
    img = create_leaf_base(base_color=(65, 130, 68))
    draw = ImageDraw.Draw(img)
    # Long cigar-shaped tan elliptical blights
    blights = [(260, 210, 55), (330, 320, 70), (280, 400, 60)]
    for bx, by, blen in blights:
        draw.polygon([
            (bx, by - blen), (bx + 20, by), (bx, by + blen), (bx - 20, by)
        ], fill=(148, 118, 75))
        draw.polygon([
            (bx, by - blen + 10), (bx + 12, by), (bx, by + blen - 10), (bx - 12, by)
        ], fill=(178, 155, 112))
    img.save(os.path.join(samples_dir, "maize_leaf_blight.jpg"), quality=92)

def create_soybean_healthy():
    img = create_leaf_base(base_color=(48, 125, 58))
    img.save(os.path.join(samples_dir, "soybean_healthy.jpg"), quality=92)

if __name__ == "__main__":
    create_cotton_bacterial_blight()
    create_cotton_leaf_curl()
    create_soybean_rust()
    create_rice_blast()
    create_maize_leaf_blight()
    create_soybean_healthy()
    print("Leaf pathology sample images successfully generated!")

