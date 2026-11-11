"""
CropGuard AI - Actual Machine Learning Disease Model Training Pipeline
Trains real classification models (Random Forest + Multi-Layer Perceptron Neural Network)
on the actual multi-class leaf pathology image dataset across 16 classes.
Saves the trained model and label encoders to ml/saved_models/.
"""

import os
import io
import json
import glob
import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, f1_score

def extract_image_features(image_path_or_bytes) -> np.ndarray:
    """Extracts a 36-dimensional spectral pathology feature vector from an image."""
    if isinstance(image_path_or_bytes, (str, bytes)):
        if isinstance(image_path_or_bytes, str):
            pil_img = Image.open(image_path_or_bytes).convert("RGB")
        else:
            pil_img = Image.open(io.BytesIO(image_path_or_bytes)).convert("RGB")
    else:
        pil_img = image_path_or_bytes.convert("RGB")

    # Resize to 224x224 for standardization
    resized = pil_img.resize((224, 224), Image.Resampling.BILINEAR)
    img_np = np.array(resized, dtype=np.float32) / 255.0

    r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
    
    # 1. RGB statistics (6 features)
    rgb_means = [float(np.mean(r)), float(np.mean(g)), float(np.mean(b))]
    rgb_stds = [float(np.std(r)), float(np.std(g)), float(np.std(b))]

    # 2. RGB to HSV conversion
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    delta = max_c - min_c

    h = np.zeros_like(max_c)
    mask = delta > 1e-5

    r_mask = mask & (max_c == r)
    h[r_mask] = ((g[r_mask] - b[r_mask]) / delta[r_mask]) % 6.0

    g_mask = mask & (max_c == g)
    h[g_mask] = ((b[g_mask] - r[g_mask]) / delta[g_mask]) + 2.0

    b_mask = mask & (max_c == b)
    h[b_mask] = ((r[b_mask] - g[b_mask]) / delta[b_mask]) + 4.0

    h = (h / 6.0) % 1.0

    s = np.zeros_like(max_c)
    s[max_c > 1e-5] = delta[max_c > 1e-5] / max_c[max_c > 1e-5]
    v = max_c

    # HSV statistics (6 features)
    hsv_means = [float(np.mean(h)), float(np.mean(s)), float(np.mean(v))]
    hsv_stds = [float(np.std(h)), float(np.std(s)), float(np.std(v))]

    # 3. Color Histograms: 10 bins for Hue, 6 bins for Saturation (16 features)
    h_hist, _ = np.histogram(h, bins=10, range=(0.0, 1.0), density=True)
    s_hist, _ = np.histogram(s, bins=6, range=(0.0, 1.0), density=True)
    h_hist = list(h_hist / (np.sum(h_hist) + 1e-6))
    s_hist = list(s_hist / (np.sum(s_hist) + 1e-6))

    # 4. Pathology Masks: Green, Chlorosis (Yellow), Necrosis (Brown), Symptom ratio (4 features)
    green_mask = (h >= 0.18) & (h <= 0.48) & (s >= 0.15) & (v >= 0.15)
    green_ratio = float(np.mean(green_mask))

    yellow_mask = (h >= 0.10) & (h < 0.18) & (s >= 0.20) & (v >= 0.20)
    yellow_ratio = float(np.mean(yellow_mask))

    brown_mask = ((h < 0.10) | (h > 0.95)) & (s >= 0.18) & (v <= 0.70) & (v >= 0.10)
    brown_ratio = float(np.mean(brown_mask))

    total_leaf = green_ratio + yellow_ratio + brown_ratio + 1e-6
    symptom_ratio = (yellow_ratio + brown_ratio) / total_leaf

    pathology_ratios = [green_ratio, yellow_ratio, brown_ratio, symptom_ratio]

    # 5. Texture & Gradient Analysis (4 features)
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
    gy, gx = np.gradient(gray)
    gradient_mag = np.sqrt(gx**2 + gy**2)
    edge_density = float(np.mean(gradient_mag > 0.08))
    gradient_mean = float(np.mean(gradient_mag))
    gradient_std = float(np.std(gradient_mag))
    gray_std = float(np.std(gray))

    texture_features = [edge_density, gradient_mean, gradient_std, gray_std]

    # Assemble full 36-dimensional vector
    feature_vector = np.array(
        rgb_means + rgb_stds + hsv_means + hsv_stds + h_hist + s_hist + pathology_ratios + texture_features,
        dtype=np.float32
    )
    return feature_vector

def load_dataset(dataset_dir: str):
    """Loads all image files and extracts feature vectors with corresponding labels."""
    X = []
    y = []

    classes = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
    print(f"Loading data from {dataset_dir} across {len(classes)} classes...")

    for cls in classes:
        cls_dir = os.path.join(dataset_dir, cls)
        img_files = glob.glob(os.path.join(cls_dir, "*.jpg"))
        for img_path in img_files:
            try:
                feats = extract_image_features(img_path)
                X.append(feats)
                y.append(cls)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")

    return np.array(X, dtype=np.float32), np.array(y)

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_dir = os.path.join(base_dir, "dataset", "train")
    val_dir = os.path.join(base_dir, "dataset", "val")
    saved_models_dir = os.path.join(base_dir, "saved_models")
    os.makedirs(saved_models_dir, exist_ok=True)

    print("==================================================================")
    print("      CropGuard AI - Actual Machine Learning Training Run        ")
    print("==================================================================")

    # 1. Load Training & Validation Data
    X_train, y_train_raw = load_dataset(train_dir)
    X_val, y_val_raw = load_dataset(val_dir)

    print(f"\nTraining Samples: {X_train.shape[0]} | Validation Samples: {X_val.shape[0]}")
    print(f"Feature Dimension: {X_train.shape[1]}")

    # 2. Encode Labels
    encoder = LabelEncoder()
    y_train = encoder.fit_transform(y_train_raw)
    y_val = encoder.transform(y_val_raw)

    # 3. Train Random Forest Classifier
    print("\n[1/2] Training Random Forest Classifier (100 Trees, Gini Impurity)...")
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)

    rf_train_acc = accuracy_score(y_train, rf_model.predict(X_train))
    rf_val_acc = accuracy_score(y_val, rf_model.predict(X_val))
    print(f"   RF Training Accuracy:   {rf_train_acc * 100:.2f}%")
    print(f"   RF Validation Accuracy: {rf_val_acc * 100:.2f}%")

    # 4. Train Multi-Layer Perceptron (Neural Network)
    print("\n[2/2] Training Multi-Layer Perceptron Neural Network (MLP: 128 -> 64, ReLU, Adam)...")
    mlp_model = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=250, random_state=42, early_stopping=True)
    mlp_model.fit(X_train, y_train)

    mlp_val_acc = accuracy_score(y_val, mlp_model.predict(X_val))
    print(f"   MLP Validation Accuracy: {mlp_val_acc * 100:.2f}%")

    # Select best model
    best_model = rf_model if rf_val_acc >= mlp_val_acc else mlp_model
    best_name = "RandomForest" if best_model is rf_model else "MLPNeuralNet"
    val_preds = best_model.predict(X_val)
    final_acc = accuracy_score(y_val, val_preds)
    final_f1 = f1_score(y_val, val_preds, average='weighted')

    print(f"\n>>> Best Model: {best_name} with Accuracy = {final_acc * 100:.2f}%, F1 = {final_f1 * 100:.2f}%")
    print("\nValidation Classification Report:")
    report_dict = classification_report(y_val, val_preds, target_names=encoder.classes_, output_dict=True)
    print(classification_report(y_val, val_preds, target_names=encoder.classes_))

    # 5. Save Model and Encoder Artifacts
    model_path = os.path.join(saved_models_dir, "cropguard_disease_model.joblib")
    encoder_path = os.path.join(saved_models_dir, "label_encoder.joblib")
    meta_path = os.path.join(saved_models_dir, "model_metadata.json")

    joblib.dump(best_model, model_path)
    joblib.dump(encoder, encoder_path)

    metadata = {
        "model_architecture": f"{best_name} Classifier (36-dimensional Spectral Pathology Features)",
        "training_samples": int(X_train.shape[0]),
        "validation_samples": int(X_val.shape[0]),
        "features_count": int(X_train.shape[1]),
        "overall_accuracy": round(float(final_acc) * 100, 2),
        "overall_f1": round(float(final_f1) * 100, 2),
        "classes": list(encoder.classes_),
        "per_class_metrics": {
            cls: {
                "precision": round(report_dict[cls]["precision"], 3),
                "recall": round(report_dict[cls]["recall"], 3),
                "f1_score": round(report_dict[cls]["f1-score"], 3),
                "support": report_dict[cls]["support"],
            }
            for cls in encoder.classes_
            if cls in report_dict
        }
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nArtifacts saved successfully:")
    print(f" - Model file:    {model_path} ({os.path.getsize(model_path) // 1024} KB)")
    print(f" - Label encoder: {encoder_path}")
    print(f" - Metadata:      {meta_path}")
    print("==================================================================")

if __name__ == "__main__":
    train_and_evaluate()
