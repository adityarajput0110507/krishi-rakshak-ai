"""
CropGuard AI - Multi-Crop Real Leaf Pathology & Complete 92-Crop Knowledge Trainer
1. Loads real agricultural leaf photographs from ml/real_dataset/{train,val}.
2. Extracts 134-dimensional multi-scale visual features via shared
   backend/app/services/leaf_features.py (so training & inference match 100%).
3. Benchmarks ExtraTrees, RandomForest, Scaled MLP, and ExtraTrees+MLP Ensemble
   on held-out real leaf validation photos (both disease-class and crop-ID metrics).
4. Saves compressed model + label encoder + model_metadata.json + complete
   92-crop ICAR crop_knowledge_index.json compiled from backend/cropguard.db.
"""

import glob
import json
import os
import sqlite3
import sys
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple

import joblib
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.leaf_features import extract_leaf_features_and_metrics  # noqa: E402


def load_real_dataset(dataset_root: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Loads train & val images, guaranteeing shared classes with clean 80/20 fallback."""
    train_dir = os.path.join(dataset_root, "train")
    val_dir = os.path.join(dataset_root, "val")

    if not os.path.isdir(train_dir):
        raise FileNotFoundError(f"Missing real dataset directory: {train_dir}")

    train_classes = sorted(d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d)))
    X_train_list: List[np.ndarray] = []
    y_train_list: List[str] = []
    X_val_list: List[np.ndarray] = []
    y_val_list: List[str] = []

    print(f"Scanning {len(train_classes)} candidate classes in {dataset_root}...", flush=True)

    for cls in train_classes:
        tr_files = sorted(glob.glob(os.path.join(train_dir, cls, "*.jpg")))
        va_files = sorted(glob.glob(os.path.join(val_dir, cls, "*.jpg"))) if os.path.isdir(os.path.join(val_dir, cls)) else []

        # Skip sparse classes that cannot generalize cleanly
        if len(tr_files) + len(va_files) < 8:
            continue

        # Ensure at least 2 validation files via deterministic holdout if val is missing
        if len(va_files) < 2 and len(tr_files) >= 8:
            n_hold = max(2, len(tr_files) // 5)
            va_files = tr_files[-n_hold:]
            tr_files = tr_files[:-n_hold]

        cls_tr = 0
        for p in tr_files:
            try:
                feats, _ = extract_leaf_features_and_metrics(p)
                X_train_list.append(feats)
                y_train_list.append(cls)
                cls_tr += 1
            except Exception as e:
                print(f"  [warn] skip {p}: {e}", flush=True)

        cls_va = 0
        for p in va_files:
            try:
                feats, _ = extract_leaf_features_and_metrics(p)
                X_val_list.append(feats)
                y_val_list.append(cls)
                cls_va += 1
            except Exception as e:
                print(f"  [warn] skip {p}: {e}", flush=True)

        if cls_tr == 0 or cls_va == 0:
            print(f"  [drop] {cls} (tr={cls_tr}, va={cls_va})", flush=True)

    # Filter so both splits share the exact same set of classes
    shared = sorted(set(y_train_list) & set(y_val_list))
    tr_idx = [i for i, y in enumerate(y_train_list) if y in shared]
    va_idx = [i for i, y in enumerate(y_val_list) if y in shared]

    X_train = np.array([X_train_list[i] for i in tr_idx], dtype=np.float32)
    y_train = np.array([y_train_list[i] for i in tr_idx])
    X_val = np.array([X_val_list[i] for i in va_idx], dtype=np.float32)
    y_val = np.array([y_val_list[i] for i in va_idx])
    return X_train, y_train, X_val, y_val


def crop_accuracy(y_true_names: np.ndarray, y_pred_names: np.ndarray) -> float:
    true_crops = [str(y).split("__")[0] for y in y_true_names]
    pred_crops = [str(y).split("__")[0] for y in y_pred_names]
    return float(np.mean([t == p for t, p in zip(true_crops, pred_crops)]))


def build_complete_crop_knowledge_index(db_path: str, trained_classes: List[str], out_json: str) -> Dict:
    """Compiles full 92-crop ICAR database details + trained visual class links."""
    trained_by_crop: Dict[str, List[str]] = defaultdict(list)
    for cls in trained_classes:
        crop_slug = cls.split("__")[0]
        trained_by_crop[crop_slug].append(cls)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    categories = {
        r["id"]: r["name"]
        for r in cur.execute("SELECT id, name FROM crop_categories").fetchall()
    }
    local_names = defaultdict(dict)
    for r in cur.execute("SELECT crop_id, language_code, local_name FROM crop_local_names").fetchall():
        local_names[r["crop_id"]][(r["language_code"] or "hi").lower()] = r["local_name"]

    seasons_by_crop = defaultdict(list)
    for r in cur.execute("SELECT crop_id, season_name FROM crop_seasons").fetchall():
        seasons_by_crop[r["crop_id"]].append(r["season_name"])

    regions_by_crop = defaultdict(list)
    for r in cur.execute("SELECT crop_id, state_name FROM crop_regions").fetchall():
        regions_by_crop[r["crop_id"]].append(r["state_name"])

    guidelines_by_crop = defaultdict(list)
    for r in cur.execute("SELECT crop_id, topic, guideline_text FROM cultivation_guidelines").fetchall():
        guidelines_by_crop[r["crop_id"]].append({"topic": r["topic"], "text": r["guideline_text"]})

    diseases_by_crop = defaultdict(list)
    q_dis = """
        SELECT r.crop_id, r.severity_potential, r.favorable_growth_stage,
               d.id AS disease_id, d.name, d.scientific_name, d.pathogen_type,
               d.symptoms, d.prevention_methods, d.biological_management,
               d.cultural_management, d.ipm_recommendations
        FROM crop_disease_relationships r
        JOIN crop_diseases d ON d.id = r.disease_id
    """
    for r in cur.execute(q_dis).fetchall():
        diseases_by_crop[r["crop_id"]].append({
            "disease_id": r["disease_id"],
            "name": r["name"],
            "scientific_name": r["scientific_name"],
            "pathogen_type": r["pathogen_type"],
            "severity_potential": r["severity_potential"],
            "growth_stage": r["favorable_growth_stage"],
            "symptoms": r["symptoms"],
            "prevention_methods": r["prevention_methods"],
            "biological_management": r["biological_management"],
            "cultural_management": r["cultural_management"],
            "ipm_recommendations": r["ipm_recommendations"],
        })

    pests_by_crop = defaultdict(list)
    q_pest = """
        SELECT r.crop_id, p.name, p.scientific_name, p.pest_type, p.economic_threshold_level
        FROM crop_pest_relationships r
        JOIN crop_pests p ON p.id = r.pest_id
    """
    for r in cur.execute(q_pest).fetchall():
        pests_by_crop[r["crop_id"]].append({
            "name": r["name"],
            "scientific_name": r["scientific_name"],
            "pest_type": r["pest_type"],
            "etl": r["economic_threshold_level"],
        })

    index: Dict[str, Dict] = {}
    crops_rows = cur.execute("SELECT * FROM crops ORDER BY id").fetchall()
    for c in crops_rows:
        slug = c["slug"]
        cid = c["id"]
        is_trained = slug in trained_by_crop
        index[slug] = {
            "crop_id": cid,
            "slug": slug,
            "name": c["name"],
            "scientific_name": c["scientific_name"],
            "category": categories.get(c["category_id"], "Crops"),
            "local_names": local_names.get(cid, {}),
            "sowing_period": c["sowing_period"],
            "harvesting_period": c["harvesting_period"],
            "suitable_soil": c["suitable_soil"],
            "temp_min": c["temp_min"],
            "temp_max": c["temp_max"],
            "water_requirement_mm": c["water_requirement_mm"],
            "major_regions": c["major_regions"],
            "states": regions_by_crop.get(cid, []),
            "seasons": seasons_by_crop.get(cid, []),
            "visual_ml_trained": is_trained,
            "visual_classes": trained_by_crop.get(slug, []),
            "diseases": diseases_by_crop.get(cid, []),
            "pests": pests_by_crop.get(cid, []),
            "cultivation_guidelines": guidelines_by_crop.get(cid, []),
        }

    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    conn.close()
    return index


def sync_database_model_registry(db_path: str, acc: float, f1: float, encoder: LabelEncoder, report_dict: Dict, train_counts: Dict[str, int]):
    """Updates Crop.is_ai_supported and ModelVersion/SupportedModelClass in SQLite DB."""
    if not os.path.exists(db_path):
        return
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    trained_crops = sorted(set(str(c).split("__")[0] for c in encoder.classes_))
    placeholders = ",".join("?" for _ in trained_crops)
    cur.execute(f"UPDATE crops SET is_ai_supported = 1 WHERE slug IN ({placeholders})", trained_crops)

    ver_name = "CropGuard-MultiCrop-RealLeaf-v2.0"
    cur.execute("UPDATE model_versions SET is_active = 0")
    existing = cur.execute("SELECT id FROM model_versions WHERE version_name = ?", (ver_name,)).fetchone()
    if existing:
        mv_id = existing[0]
        cur.execute(
            """
            UPDATE model_versions
            SET architecture = ?, training_dataset = ?, overall_accuracy = ?, overall_f1 = ?,
                training_date = ?, is_active = 1, notes = ?
            WHERE id = ?
            """,
            (
                "ExtraTrees + Scaled-MLP Ensemble (134-dim Multi-Scale Plant Pathology)",
                f"Real Field & Leaf Datasets ({len(trained_crops)} Indian crops, {len(encoder.classes_)} classes)",
                round(acc * 100, 2),
                round(f1 * 100, 2),
                datetime.now().strftime("%Y-%m-%d"),
                "Trained on real public crop leaf photos paired with 92-crop ICAR SQLite details.",
                mv_id,
            ),
        )
        cur.execute("DELETE FROM supported_model_classes WHERE model_version_id = ?", (mv_id,))
    else:
        cur.execute(
            """
            INSERT INTO model_versions (version_name, architecture, input_resolution, training_dataset,
                overall_accuracy, overall_f1, training_date, is_active, notes)
            VALUES (?, ?, '224x224x3', ?, ?, ?, ?, 1, ?)
            """,
            (
                ver_name,
                "ExtraTrees + Scaled-MLP Ensemble (134-dim Multi-Scale Plant Pathology)",
                f"Real Field & Leaf Datasets ({len(trained_crops)} Indian crops, {len(encoder.classes_)} classes)",
                round(acc * 100, 2),
                round(f1 * 100, 2),
                datetime.now().strftime("%Y-%m-%d"),
                "Trained on real public crop leaf photos paired with 92-crop ICAR SQLite details.",
            ),
        )
        mv_id = cur.lastrowid

    crop_id_map = {r[0]: (r[1], r[2]) for r in cur.execute("SELECT slug, id, name FROM crops").fetchall()}
    for cls in encoder.classes_:
        crop_slug, cond = str(cls).split("__", 1)
        if crop_slug not in crop_id_map:
            continue
        cid, cname = crop_id_map[crop_slug]
        m = report_dict.get(cls, {})
        cur.execute(
            """
            INSERT INTO supported_model_classes (
                model_version_id, crop_id, crop_name, disease_name, class_label,
                precision_score, recall_score, f1_score, sample_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                mv_id,
                cid,
                cname,
                cond.replace("_", " ").title(),
                cls,
                round(float(m.get("precision", 0.0)), 3),
                round(float(m.get("recall", 0.0)), 3),
                round(float(m.get("f1-score", 0.0)), 3),
                int(train_counts.get(cls, 0)),
            ),
        )

    conn.commit()
    conn.close()


def train_and_evaluate():
    ml_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    real_dataset_dir = os.path.join(ml_dir, "real_dataset")
    saved_models_dir = os.path.join(ml_dir, "saved_models")
    os.makedirs(saved_models_dir, exist_ok=True)

    print("==================================================================", flush=True)
    print("  CropGuard AI - Real Multi-Crop Leaf Pathology Training Run      ", flush=True)
    print("==================================================================", flush=True)

    X_train, y_train_raw, X_val, y_val_raw = load_real_dataset(real_dataset_dir)
    trained_classes = sorted(set(y_train_raw))
    trained_crops = sorted(set(c.split("__")[0] for c in trained_classes))
    train_counts = {c: int(np.sum(y_train_raw == c)) for c in trained_classes}

    print(f"\nTrain Samples: {X_train.shape[0]} | Val Samples: {X_val.shape[0]}", flush=True)
    print(f"Classes: {len(trained_classes)} | Real-Photo Crops: {len(trained_crops)} | Feature Dim: {X_train.shape[1]}", flush=True)

    encoder = LabelEncoder()
    y_train = encoder.fit_transform(y_train_raw)
    y_val = encoder.transform(y_val_raw)

    et_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", ExtraTreesClassifier(n_estimators=220, max_depth=24, class_weight="balanced", random_state=42, n_jobs=-1)),
    ])
    rf_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=220, max_depth=22, class_weight="balanced", random_state=42, n_jobs=-1)),
    ])
    mlp_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", MLPClassifier(hidden_layer_sizes=(256, 128), alpha=1e-3, max_iter=350, early_stopping=True, random_state=42)),
    ])
    ens_pipe = VotingClassifier(
        estimators=[
            ("et", ExtraTreesClassifier(n_estimators=200, max_depth=22, class_weight="balanced", random_state=42, n_jobs=-1)),
            ("mlp", Pipeline([("scaler", StandardScaler()), ("clf", MLPClassifier(hidden_layer_sizes=(256, 128), alpha=1e-3, max_iter=350, early_stopping=True, random_state=42))])),
        ],
        voting="soft",
        weights=[1.0, 1.3],
    )

    candidates = [
        ("ExtraTrees", et_pipe),
        ("RandomForest", rf_pipe),
        ("ScaledMLP", mlp_pipe),
        ("ExtraTrees+MLP_Ensemble", ens_pipe),
    ]

    best_name = ""
    best_model = None
    best_score = -1.0
    best_preds = None

    for name, mdl in candidates:
        print(f"\nTraining {name}...", flush=True)
        mdl.fit(X_train, y_train)
        preds = mdl.predict(X_val)
        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds, average="weighted")
        pred_names = encoder.inverse_transform(preds)
        c_acc = crop_accuracy(y_val_raw, pred_names)
        score = 0.6 * acc + 0.4 * c_acc
        print(f"  -> Class Val Acc: {acc*100:.2f}% | Weighted F1: {f1*100:.2f}% | Crop-ID Val Acc: {c_acc*100:.2f}%", flush=True)
        if score > best_score:
            best_score = score
            best_name = name
            best_model = mdl
            best_preds = preds

    final_acc = accuracy_score(y_val, best_preds)
    final_f1 = f1_score(y_val, best_preds, average="weighted")
    final_crop_acc = crop_accuracy(y_val_raw, encoder.inverse_transform(best_preds))

    print(f"\n>>> SELECTED BEST MODEL: {best_name}", flush=True)
    print(f"    Class Accuracy: {final_acc*100:.2f}% | Crop-ID Accuracy: {final_crop_acc*100:.2f}% | Weighted F1: {final_f1*100:.2f}%", flush=True)

    report_dict = classification_report(y_val, best_preds, target_names=encoder.classes_, output_dict=True, zero_division=0)

    # Compute per-crop validation accuracies
    per_crop_metrics = {}
    val_pred_names = encoder.inverse_transform(best_preds)
    for crop in trained_crops:
        mask = np.array([str(y).split("__")[0] == crop for y in y_val_raw])
        if np.any(mask):
            c_cls_acc = float(np.mean(y_val[mask] == best_preds[mask]))
            c_id_acc = float(np.mean([str(p).split("__")[0] == crop for p in val_pred_names[mask]]))
            per_crop_metrics[crop] = {
                "crop_id_accuracy": round(c_id_acc * 100, 1),
                "disease_accuracy": round(c_cls_acc * 100, 1),
                "val_samples": int(np.sum(mask)),
            }

    model_path = os.path.join(saved_models_dir, "cropguard_disease_model.joblib")
    encoder_path = os.path.join(saved_models_dir, "label_encoder.joblib")
    meta_path = os.path.join(saved_models_dir, "model_metadata.json")
    knowledge_path = os.path.join(saved_models_dir, "crop_knowledge_index.json")

    joblib.dump(best_model, model_path, compress=3)
    joblib.dump(encoder, encoder_path, compress=3)

    metadata = {
        "model_architecture": f"{best_name} (134-dim Multi-Scale Plant Pathology Descriptor)",
        "dataset_type": "Real-World & Benchmark Multi-Crop Leaf Photos (PlantVillage + PlantDoc + Cotton + Wheat + Sugarcane + Mango + Papaya + Project-AgML)",
        "training_samples": int(X_train.shape[0]),
        "validation_samples": int(X_val.shape[0]),
        "features_count": int(X_train.shape[1]),
        "trained_crops_count": len(trained_crops),
        "trained_crops": trained_crops,
        "overall_accuracy": round(float(final_acc) * 100, 2),
        "crop_identification_accuracy": round(float(final_crop_acc) * 100, 2),
        "overall_f1": round(float(final_f1) * 100, 2),
        "classes": list(encoder.classes_),
        "per_crop_metrics": per_crop_metrics,
        "per_class_metrics": {
            cls: {
                "precision": round(report_dict[cls]["precision"], 3),
                "recall": round(report_dict[cls]["recall"], 3),
                "f1_score": round(report_dict[cls]["f1-score"], 3),
                "support": report_dict[cls]["support"],
            }
            for cls in encoder.classes_
            if cls in report_dict
        },
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Compile full 92-crop ICAR database knowledge index & update DB registry
    for db_p in [os.path.join(BACKEND_DIR, "cropguard.db"), os.path.join(ROOT_DIR, "cropguard.db")]:
        if os.path.exists(db_p):
            build_complete_crop_knowledge_index(db_p, trained_classes, knowledge_path)
            sync_database_model_registry(db_p, final_acc, final_f1, encoder, report_dict, train_counts)

    print(f"\nSaved artifacts:", flush=True)
    print(f" - Model:     {model_path} ({os.path.getsize(model_path) / (1024*1024):.2f} MB)", flush=True)
    print(f" - Encoder:   {encoder_path}", flush=True)
    print(f" - Metadata:  {meta_path}", flush=True)
    print(f" - Knowledge: {knowledge_path}", flush=True)
    print("==================================================================", flush=True)


if __name__ == "__main__":
    train_and_evaluate()
