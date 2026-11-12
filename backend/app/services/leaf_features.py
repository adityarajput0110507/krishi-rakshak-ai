"""
Shared Multi-Scale Plant Pathology & Foliar Feature Extractor (134-dim, Pure NumPy + PIL)
Used identically by training (ml/training/train_disease_classifier.py) and live inference
(backend/app/services/ml_disease_service.py) so feature distributions never drift.
"""

import io
from typing import Any, Dict, Tuple, Union
import numpy as np
from PIL import Image


def _compute_hsv(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    delta = max_c - min_c

    h = np.zeros_like(max_c)
    mask = delta > 1e-5
    r_mask = mask & (max_c == r)
    g_mask = mask & (max_c == g)
    b_mask = mask & (max_c == b)
    h[r_mask] = ((g[r_mask] - b[r_mask]) / delta[r_mask]) % 6.0
    h[g_mask] = ((b[g_mask] - r[g_mask]) / delta[g_mask]) + 2.0
    h[b_mask] = ((r[b_mask] - g[b_mask]) / delta[b_mask]) + 4.0
    h = (h / 6.0) % 1.0

    s = np.zeros_like(max_c)
    s[max_c > 1e-5] = delta[max_c > 1e-5] / max_c[max_c > 1e-5]
    return h, s, max_c


def extract_leaf_features_and_metrics(
    image_input: Union[bytes, str, Image.Image]
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Extracts a 134-dimensional normalized visual pathology vector plus
    deterministic leaf-validation and damage metrics.
    """
    if isinstance(image_input, str):
        pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, (bytes, bytearray)):
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    else:
        pil_img = image_input.convert("RGB")

    width, height = pil_img.size
    resized = pil_img.resize((224, 224), Image.Resampling.BILINEAR)
    img_np = np.array(resized, dtype=np.float32) / 255.0
    r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]

    h, s, v = _compute_hsv(r, g, b)

    # 1. Global & Center RGB / HSV stats (24 dims)
    cr, cg, cb = r[48:176, 48:176], g[48:176, 48:176], b[48:176, 48:176]
    ch, cs, cv = h[48:176, 48:176], s[48:176, 48:176], v[48:176, 48:176]
    rgb_stats = [
        float(np.mean(r)), float(np.mean(g)), float(np.mean(b)),
        float(np.std(r)), float(np.std(g)), float(np.std(b)),
        float(np.mean(cr)), float(np.mean(cg)), float(np.mean(cb)),
        float(np.std(cr)), float(np.std(cg)), float(np.std(cb)),
    ]
    hsv_stats = [
        float(np.mean(h)), float(np.mean(s)), float(np.mean(v)),
        float(np.std(h)), float(np.std(s)), float(np.std(v)),
        float(np.mean(ch)), float(np.mean(cs)), float(np.mean(cv)),
        float(np.std(ch)), float(np.std(cs)), float(np.std(cv)),
    ]

    # 2. Color histograms (12 + 8 + 8 = 28 dims)
    h_hist, _ = np.histogram(h, bins=12, range=(0.0, 1.0))
    s_hist, _ = np.histogram(s, bins=8, range=(0.0, 1.0))
    v_hist, _ = np.histogram(v, bins=8, range=(0.0, 1.0))
    pix_n = float(r.size) + 1e-6
    hist_feats = (
        list(h_hist.astype(np.float32) / pix_n)
        + list(s_hist.astype(np.float32) / pix_n)
        + list(v_hist.astype(np.float32) / pix_n)
    )

    # 3. Botanical Pathology Masks & Excess Green Index (ExG)
    exg = 2.0 * g - r - b
    green_mask = (h >= 0.19) & (h <= 0.42) & (s >= 0.18) & (v >= 0.15) & (exg > 0.05)
    green_ratio = float(np.mean(green_mask))
    center_green_ratio = float(np.mean(green_mask[50:174, 50:174]))

    yellow_mask = (h >= 0.10) & (h < 0.19) & (s >= 0.22) & (v >= 0.20)
    yellow_ratio = float(np.mean(yellow_mask))

    rust_orange_mask = (h >= 0.03) & (h < 0.10) & (s >= 0.35) & (v >= 0.18)
    rust_orange_ratio = float(np.mean(rust_orange_mask))

    brown_mask = ((h < 0.10) | (h > 0.94)) & (s >= 0.20) & (v >= 0.08) & (v <= 0.55)
    brown_ratio = float(np.mean(brown_mask))

    tan_spot_mask = (h >= 0.06) & (h < 0.14) & (s >= 0.18) & (s <= 0.65) & (v >= 0.30) & (v <= 0.78)
    tan_spot_ratio = float(np.mean(tan_spot_mask))

    powdery_white_mask = (s < 0.16) & (v > 0.55) & (v < 0.96)
    powdery_white_ratio = float(np.mean(powdery_white_mask[50:174, 50:174]))

    # 4. 3x3 Spatial Grid (9 cells x 4 features = 36 dims)
    grid_feats = []
    edges_3 = [0, 75, 150, 224]
    for yi in range(3):
        for xi in range(3):
            ys, ye = edges_3[yi], edges_3[yi + 1]
            xs, xe = edges_3[xi], edges_3[xi + 1]
            grid_feats.extend([
                float(np.mean(exg[ys:ye, xs:xe])),
                float(np.mean(green_mask[ys:ye, xs:xe])),
                float(np.mean(yellow_mask[ys:ye, xs:xe])),
                float(np.mean(brown_mask[ys:ye, xs:xe])),
            ])

    # 5. Gradient, Vein Orientation (HOG-8), Multi-Scale Texture & UI Gate
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
    gy, gx = np.gradient(gray)
    grad_mag = np.sqrt(gx**2 + gy**2)
    edge_density = float(np.mean(grad_mag > 0.08))
    edge_soft_density = float(np.mean(grad_mag > 0.025))
    grad_mean = float(np.mean(grad_mag))
    grad_std = float(np.std(grad_mag))
    gray_std = float(np.std(gray))

    fol_pixels = int(np.sum(green_mask))
    fol_grad_mean = float(np.mean(grad_mag[green_mask])) if fol_pixels > 80 else 0.0
    fol_flat_ratio = (
        float(np.sum((grad_mag < 0.005) & green_mask)) / max(1, fol_pixels)
        if fol_pixels > 80
        else 1.0
    )

    strong_edges = grad_mag > 0.05
    axis_edges = strong_edges & ((np.abs(gx) < 0.008) | (np.abs(gy) < 0.008))
    axis_edge_ratio = float(np.sum(axis_edges)) / max(1, int(np.sum(strong_edges)))

    # Edge Orientation Histogram (8 bins across [0, pi))
    angles = np.arctan2(gy, gx) % np.pi
    hog_hist, _ = np.histogram(angles, bins=8, range=(0.0, np.pi), weights=grad_mag)
    hog_hist = list(hog_hist.astype(np.float32) / (float(np.sum(hog_hist)) + 1e-6))

    # Multi-scale lag texture differences (6 dims)
    multiscale_feats = []
    for lag in (1, 3, 6):
        dx = np.abs(gray[:, lag:] - gray[:, :-lag])
        dy = np.abs(gray[lag:, :] - gray[:-lag, :])
        combined_d = np.concatenate([dx.ravel(), dy.ravel()])
        multiscale_feats.extend([float(np.mean(combined_d)), float(np.std(combined_d))])

    # Pathology vector (12 dims)
    total_leaf = green_ratio + yellow_ratio + brown_ratio + 1e-6
    symptom_ratio = (yellow_ratio + brown_ratio) / total_leaf
    pathology_feats = [
        green_ratio,
        center_green_ratio,
        yellow_ratio,
        rust_orange_ratio,
        brown_ratio,
        tan_spot_ratio,
        powdery_white_ratio,
        float(np.mean(exg)),
        float(np.std(exg)),
        symptom_ratio,
        fol_grad_mean,
        fol_flat_ratio,
    ]

    texture_feats = (
        hog_hist
        + multiscale_feats
        + [edge_density, edge_soft_density, grad_mean, grad_std, gray_std, axis_edge_ratio]
    )

    # 6. Leaf Silhouette & Quadrant Symmetry (14 dims)
    leaf_blob = green_mask | yellow_mask | brown_mask
    fill_factor = float(np.mean(leaf_blob))
    ys_idx, xs_idx = np.where(leaf_blob)
    if ys_idx.size > 20:
        bbox_h = float(ys_idx.max() - ys_idx.min() + 1) / 224.0
        bbox_w = float(xs_idx.max() - xs_idx.min() + 1) / 224.0
        aspect_bbox = bbox_w / max(0.05, bbox_h)
    else:
        aspect_bbox = 1.0

    q_ul = float(np.mean(green_mask[:112, :112]))
    q_ur = float(np.mean(green_mask[:112, 112:]))
    q_ll = float(np.mean(green_mask[112:, :112]))
    q_lr = float(np.mean(green_mask[112:, 112:]))
    h_sym = 1.0 - float(np.mean(np.abs(leaf_blob[:, :112].astype(np.float32) - np.fliplr(leaf_blob[:, 112:]).astype(np.float32))))
    v_sym = 1.0 - float(np.mean(np.abs(leaf_blob[:112, :].astype(np.float32) - np.flipud(leaf_blob[112:, :]).astype(np.float32))))

    perim_band = np.zeros_like(green_mask)
    perim_band[:32, :] = True
    perim_band[-32:, :] = True
    perim_band[:, :32] = True
    perim_band[:, -32:] = True
    perim_green = float(np.mean(green_mask[perim_band]))
    center_vs_edge_green = center_green_ratio - perim_green

    exg_pos_ratio = float(np.mean(exg > 0.02))
    proj_x = np.mean(leaf_blob.astype(np.float32), axis=0)
    proj_y = np.mean(leaf_blob.astype(np.float32), axis=1)
    border_contrast = float(np.abs(np.mean(gray[50:174, 50:174]) - np.mean(gray[perim_band])))
    center_dark_lesion_ratio = float(np.mean((v[50:174, 50:174] < 0.25) & (s[50:174, 50:174] > 0.15)))

    geom_feats = [
        q_ul, q_ur, q_ll, q_lr, h_sym, v_sym,
        fill_factor, aspect_bbox, center_vs_edge_green, exg_pos_ratio,
        float(np.std(proj_x)), float(np.std(proj_y)),
        border_contrast, center_dark_lesion_ratio,
    ]

    full_vec = np.array(
        rgb_stats + hsv_stats + hist_feats + grid_feats + pathology_feats + texture_feats + geom_feats,
        dtype=np.float32,
    )
    full_vec = np.nan_to_num(full_vec, nan=0.0, posinf=0.0, neginf=0.0)

    # Robust botanical leaf vs non-leaf / digital UI discrimination
    plant_tissue_total = green_ratio + yellow_ratio + brown_ratio + rust_orange_ratio + tan_spot_ratio
    has_plant_pigment = (plant_tissue_total >= 0.07) and (
        (green_ratio >= 0.015) or ((yellow_ratio + brown_ratio + rust_orange_ratio) >= 0.035)
    )

    # Pure artificial non-plant colors (deep blue, indigo, magenta: H in [0.54, 0.88])
    non_plant_vivid = float(np.mean(((h >= 0.54) & (h <= 0.88)) & (s >= 0.22) & (v >= 0.18)))

    # Digital UI / screenshot with high axis-aligned linear edges or flat vector blocks
    is_digital_ui = (axis_edge_ratio >= 0.78) or (fol_flat_ratio >= 0.90 and axis_edge_ratio >= 0.55)

    has_texture = (gray_std >= 0.02) and (edge_soft_density >= 0.010)

    is_leaf_like = (
        has_plant_pigment
        and (non_plant_vivid < 0.35)
        and has_texture
        and (not is_digital_ui)
    )

    combined_symptom = min(1.0, (yellow_ratio * 0.65 + brown_ratio * 1.1 + tan_spot_ratio * 0.55) * 1.8)
    metrics = {
        "green_ratio": green_ratio,
        "center_green_ratio": center_green_ratio,
        "yellow_ratio": yellow_ratio,
        "rust_orange_ratio": rust_orange_ratio,
        "brown_ratio": brown_ratio,
        "tan_spot_ratio": tan_spot_ratio,
        "powdery_white_ratio": powdery_white_ratio,
        "edge_density": edge_density,
        "edge_soft_density": edge_soft_density,
        "gray_std": gray_std,
        "fol_grad_mean": fol_grad_mean,
        "fol_flat_ratio": fol_flat_ratio,
        "axis_edge_ratio": axis_edge_ratio,
        "non_plant_vivid": non_plant_vivid,
        "damage_percentage": round(min(100.0, max(0.0, float(combined_symptom) * 100.0)), 1),
        "aspect_ratio": width / max(1, height),
        "is_leaf_like": is_leaf_like,
    }
    return full_vec, metrics

