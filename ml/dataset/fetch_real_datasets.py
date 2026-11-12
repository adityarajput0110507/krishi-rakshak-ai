"""
CropGuard AI - Real Multi-Crop Leaf Dataset Collector
Collects balanced real-world & benchmark agricultural leaf photographs from open-source
GitHub and HuggingFace Project-AgML repositories across Indian crops in cropguard.db.

Saves standardized 224x224 JPEG images into:
  ml/real_dataset/train/<crop_slug>__<condition>/
  ml/real_dataset/val/<crop_slug>__<condition>/
"""

import concurrent.futures
import io
import json
import os
import random
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Tuple
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPOS_CACHE = os.path.join(BASE_DIR, "_repos")
OUT_ROOT = os.path.join(os.path.dirname(BASE_DIR), "real_dataset")

TRAIN_CAP_PER_CLASS = 40
VAL_CAP_PER_CLASS = 12
SEED = 42


def slugify_cond(raw: str) -> str:
    s = raw.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s or "unknown"


# Canonical CropGuard slug + condition mapping for PlantVillage & PlantDoc
PLANTVILLAGE_MAP: Dict[str, Tuple[str, str]] = {
    "Apple___Apple_scab": ("apple", "apple_scab"),
    "Apple___Black_rot": ("apple", "black_rot"),
    "Apple___Cedar_apple_rust": ("apple", "cedar_apple_rust"),
    "Apple___healthy": ("apple", "healthy"),
    "Cherry_(including_sour)___Powdery_mildew": ("apple", "powdery_mildew"),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("maize", "gray_leaf_spot"),
    "Corn_(maize)___Common_rust_": ("maize", "common_rust"),
    "Corn_(maize)___Northern_Leaf_Blight": ("maize", "northern_leaf_blight"),
    "Corn_(maize)___healthy": ("maize", "healthy"),
    "Grape___Black_rot": ("grapes", "black_rot"),
    "Grape___Esca_(Black_Measles)": ("grapes", "esca_black_measles"),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("grapes", "leaf_blight"),
    "Grape___healthy": ("grapes", "healthy"),
    "Orange___Haunglongbing_(Citrus_greening)": ("orange", "citrus_greening"),
    "Pepper,_bell___Bacterial_spot": ("capsicum", "bacterial_spot"),
    "Pepper,_bell___healthy": ("capsicum", "healthy"),
    "Potato___Early_blight": ("potato", "early_blight"),
    "Potato___Late_blight": ("potato", "late_blight"),
    "Potato___healthy": ("potato", "healthy"),
    "Soybean___healthy": ("soybean", "healthy"),
    "Squash___Powdery_mildew": ("pumpkin", "powdery_mildew"),
    "Tomato___Bacterial_spot": ("tomato", "bacterial_spot"),
    "Tomato___Early_blight": ("tomato", "early_blight"),
    "Tomato___Late_blight": ("tomato", "late_blight"),
    "Tomato___Leaf_Mold": ("tomato", "leaf_mold"),
    "Tomato___Septoria_leaf_spot": ("tomato", "septoria_leaf_spot"),
    "Tomato___Spider_mites Two-spotted_spider_mite": ("tomato", "spider_mites"),
    "Tomato___Target_Spot": ("tomato", "target_spot"),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("tomato", "tomato_leaf_curl_virus"),
    "Tomato___Tomato_mosaic_virus": ("tomato", "tomato_mosaic_virus"),
    "Tomato___healthy": ("tomato", "healthy"),
}

PLANTDOC_MAP: Dict[str, Tuple[str, str]] = {
    "Apple Scab Leaf": ("apple", "apple_scab"),
    "Apple leaf": ("apple", "healthy"),
    "Apple rust leaf": ("apple", "cedar_apple_rust"),
    "Bell_pepper leaf": ("capsicum", "healthy"),
    "Bell_pepper leaf spot": ("capsicum", "bacterial_spot"),
    "Corn Gray leaf spot": ("maize", "gray_leaf_spot"),
    "Corn leaf blight": ("maize", "northern_leaf_blight"),
    "Corn rust leaf": ("maize", "common_rust"),
    "Grape leaf": ("grapes", "healthy"),
    "Grape leaf black rot": ("grapes", "black_rot"),
    "Potato leaf early blight": ("potato", "early_blight"),
    "Potato leaf late blight": ("potato", "late_blight"),
    "Soyabean leaf": ("soybean", "healthy"),
    "Squash Powdery mildew leaf": ("pumpkin", "powdery_mildew"),
    "Tomato Early blight leaf": ("tomato", "early_blight"),
    "Tomato Septoria leaf spot": ("tomato", "septoria_leaf_spot"),
    "Tomato leaf": ("tomato", "healthy"),
    "Tomato leaf bacterial spot": ("tomato", "bacterial_spot"),
    "Tomato leaf late blight": ("tomato", "late_blight"),
    "Tomato leaf mosaic virus": ("tomato", "tomato_mosaic_virus"),
    "Tomato leaf yellow virus": ("tomato", "tomato_leaf_curl_virus"),
    "Tomato mold leaf": ("tomato", "leaf_mold"),
}


def ensure_sparse_index(repo: str, branch: str) -> List[str]:
    """Clones git tree metadata without downloading blobs and returns all image paths."""
    os.makedirs(REPOS_CACHE, exist_ok=True)
    safe_name = repo.replace("/", "__")
    repo_dir = os.path.join(REPOS_CACHE, safe_name)
    if not os.path.exists(os.path.join(repo_dir, ".git")):
        cmd = [
            "git",
            "clone",
            "--depth",
            "1",
            "--filter=blob:none",
            "--no-checkout",
            f"https://github.com/{repo}.git",
            repo_dir,
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = subprocess.check_output(
        ["git", "-C", repo_dir, "ls-tree", "-r", "--name-only", "HEAD"],
        text=True,
        encoding="utf-8",
        errors="ignore",
    )
    return [
        line.strip()
        for line in out.splitlines()
        if line.strip().lower().endswith((".jpg", ".jpeg", ".png"))
    ]


def download_and_save(url: str, dest_path: str) -> bool:
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 512:
        return True
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CropGuard-DatasetFetcher/1.0"})
            with urllib.request.urlopen(req, timeout=15) as r:
                raw = r.read()
            img = Image.open(io.BytesIO(raw)).convert("RGB")
            if img.width < 32 or img.height < 32:
                return False
            img = img.resize((224, 224), Image.Resampling.BILINEAR)
            img.save(dest_path, format="JPEG", quality=88)
            return True
        except Exception:
            time.sleep(0.3)
    return False


def schedule_github_downloads() -> List[Tuple[str, str]]:
    """Collects (url, dest_path) tasks across all curated GitHub repositories."""
    rng = random.Random(SEED)
    tasks: List[Tuple[str, str]] = []
    class_buckets: Dict[Tuple[str, str], List[str]] = {}  # (split, label_dir) -> [urls]

    def add_sample(split: str, crop: str, cond: str, url: str):
        label_dir = f"{crop}__{slugify_cond(cond)}"
        class_buckets.setdefault((split, label_dir), []).append(url)

    def raw_url(repo: str, branch: str, path: str) -> str:
        quoted = "/".join(urllib.parse.quote(part) for part in path.split("/"))
        return f"https://raw.githubusercontent.com/{repo}/{branch}/{quoted}"

    # 1. PlantVillage-Dataset (raw/color)
    print("[GitHub] Indexing spMohanty/PlantVillage-Dataset...", flush=True)
    pv_paths = ensure_sparse_index("spMohanty/PlantVillage-Dataset", "master")
    by_cls: Dict[str, List[str]] = {}
    for p in pv_paths:
        if p.startswith("raw/color/"):
            parts = p.split("/")
            if len(parts) >= 4 and parts[2] in PLANTVILLAGE_MAP:
                by_cls.setdefault(parts[2], []).append(p)
    for pv_cls, paths in by_cls.items():
        crop, cond = PLANTVILLAGE_MAP[pv_cls]
        rng.shuffle(paths)
        chosen = paths[: TRAIN_CAP_PER_CLASS + VAL_CAP_PER_CLASS]
        n_val = min(VAL_CAP_PER_CLASS, max(2, len(chosen) // 5))
        for p in chosen[: len(chosen) - n_val]:
            add_sample("train", crop, cond, raw_url("spMohanty/PlantVillage-Dataset", "master", p))
        for p in chosen[len(chosen) - n_val :]:
            add_sample("val", crop, cond, raw_url("spMohanty/PlantVillage-Dataset", "master", p))

    # 2. PlantDoc-Dataset (real outdoor field leaves)
    print("[GitHub] Indexing pratikkayal/PlantDoc-Dataset...", flush=True)
    pd_paths = ensure_sparse_index("pratikkayal/PlantDoc-Dataset", "master")
    for p in pd_paths:
        parts = p.split("/")
        if len(parts) >= 3 and parts[0] in ("train", "test") and parts[1] in PLANTDOC_MAP:
            split = "train" if parts[0] == "train" else "val"
            crop, cond = PLANTDOC_MAP[parts[1]]
            add_sample(split, crop, cond, raw_url("pratikkayal/PlantDoc-Dataset", "master", p))

    # 3. Cotton-Disease-Prediction
    print("[GitHub] Indexing auchinto-c/Cotton-Disease-Prediction...", flush=True)
    cot_paths = ensure_sparse_index("auchinto-c/Cotton-Disease-Prediction", "main")
    for p in cot_paths:
        parts = p.split("/")
        if len(parts) >= 4 and parts[0] == "Datasets" and parts[1] in ("train", "val"):
            folder = parts[2].lower()
            if "leaf" in folder or "plant" in folder:
                cond = "healthy" if "fresh" in folder else "diseased_leaf"
                add_sample(parts[1], "cotton", cond, raw_url("auchinto-c/Cotton-Disease-Prediction", "main", p))

    # 4. Sugarcane
    print("[GitHub] Indexing Neill-Erasmus/sugarcane-leaf-disease-detection...", flush=True)
    sug_paths = ensure_sparse_index("Neill-Erasmus/sugarcane-leaf-disease-detection", "main")
    sug_map = {
        "Healthy": "healthy",
        "Mosaic": "mosaic_virus",
        "RedRot": "red_rot",
        "Rust": "rust",
        "Yellow": "yellow_leaf_disease",
    }
    for p in sug_paths:
        parts = p.split("/")
        if len(parts) >= 4 and parts[0] == "data" and parts[1] in ("train", "val") and parts[2] in sug_map:
            add_sample(parts[1], "sugarcane", sug_map[parts[2]], raw_url("Neill-Erasmus/sugarcane-leaf-disease-detection", "main", p))

    # 5. Wheat
    print("[GitHub] Indexing aadium/wheat-disease-detection...", flush=True)
    wh_paths = ensure_sparse_index("aadium/wheat-disease-detection", "main")
    wh_map = {
        "Wheat_Leaf_Rust": "leaf_rust",
        "Wheat_Loose_Smut": "loose_smut",
        "Wheat_crown_root_rot": "crown_root_rot",
        "Wheat_healthy": "healthy",
    }
    wh_by_cls: Dict[str, List[str]] = {}
    for p in wh_paths:
        parts = p.split("/")
        if len(parts) >= 3 and parts[0] == "cropDiseaseDataset" and parts[1] in wh_map:
            wh_by_cls.setdefault(parts[1], []).append(p)
    for cls_name, paths in wh_by_cls.items():
        rng.shuffle(paths)
        chosen = paths[: TRAIN_CAP_PER_CLASS + VAL_CAP_PER_CLASS]
        n_val = min(VAL_CAP_PER_CLASS, max(3, len(chosen) // 5))
        for p in chosen[: len(chosen) - n_val]:
            add_sample("train", "wheat", wh_map[cls_name], raw_url("aadium/wheat-disease-detection", "main", p))
        for p in chosen[len(chosen) - n_val :]:
            add_sample("val", "wheat", wh_map[cls_name], raw_url("aadium/wheat-disease-detection", "main", p))

    # 6. Mango
    print("[GitHub] Indexing IsaacMwendwa/Omdena-Mango-Leaf-Disease-Detection...", flush=True)
    mg_paths = ensure_sparse_index("IsaacMwendwa/Omdena-Mango-Leaf-Disease-Detection", "main")
    mg_prefix = "src/data/MangoLeafBD_Without_Testset_Augmentation/"
    mg_map = {
        "Anthracnose": "anthracnose",
        "Bacterial Canker": "bacterial_canker",
        "Die Back": "die_back",
        "Healthy": "healthy",
        "Powdery Mildew": "powdery_mildew",
        "Powdary Mildew": "powdery_mildew",
        "Sooty Mould": "sooty_mould",
        "Scooty Mould": "sooty_mould",
        "Gall Midge": "gall_midge",
    }
    for p in mg_paths:
        if p.startswith(mg_prefix):
            sub = p[len(mg_prefix) :].split("/")
            if len(sub) >= 3 and sub[0] in ("Train", "Test") and sub[1] in mg_map:
                split = "train" if sub[0] == "Train" else "val"
                add_sample(split, "mango", mg_map[sub[1]], raw_url("IsaacMwendwa/Omdena-Mango-Leaf-Disease-Detection", "main", p))

    # 7. Papaya
    print("[GitHub] Indexing imdadulhaque1/papaya...", flush=True)
    pap_paths = ensure_sparse_index("imdadulhaque1/papaya", "master")
    for p in pap_paths:
        parts = p.split("/")
        if len(parts) >= 3 and parts[0] in ("training", "validation") and parts[1] in ("fresh", "disease"):
            split = "train" if parts[0] == "training" else "val"
            cond = "healthy" if parts[1] == "fresh" else "leaf_disease"
            add_sample(split, "papaya", cond, raw_url("imdadulhaque1/papaya", "master", p))

    # Cap per bucket so classes remain balanced & fast
    for (split, label_dir), urls in sorted(class_buckets.items()):
        cap = TRAIN_CAP_PER_CLASS if split == "train" else VAL_CAP_PER_CLASS
        rng.shuffle(urls)
        for idx, url in enumerate(urls[:cap]):
            dest = os.path.join(OUT_ROOT, split, label_dir, f"gh_{idx:03d}.jpg")
            tasks.append((url, dest))

    print(f"[GitHub] Scheduled {len(tasks)} image downloads across {len(set(k[1] for k in class_buckets))} classes.", flush=True)
    return tasks


def fetch_hf_datasets() -> List[Tuple[str, str]]:
    """Politely queries Project-AgML HuggingFace datasets for additional Indian crops."""
    hf_specs = [
        ("rice", "Project-AgML/rice_leaf_disease_classification_india", "default"),
        ("rice", "Project-AgML/rice_leaf_disease_classification", "default"),
        ("banana", "Project-AgML/banana_leaf_disease_classification", "default"),
        ("chilli", "Project-AgML/COLD_chili_leaf_disease_classification", "raw"),
        ("onion", "Project-AgML/COLD_onion_leaf_disease_classification", "raw"),
        ("brinjal", "Project-AgML/eggplant_leaf_disease_classification", "raw"),
        ("okra", "Project-AgML/OkraDiseaseNet_disease_classification", "default"),
        ("cauliflower", "Project-AgML/cauliflower_leaf_disease_classification", "default"),
        ("guava", "Project-AgML/guava_disease_classification", "default"),
        ("pomegranate", "Project-AgML/pomegranate_disease_classification", "raw"),
        ("watermelon", "Project-AgML/watermelon_disease_classification", "default"),
        ("cucumber", "Project-AgML/cucumber_disease_classification", "default"),
        ("black-gram-urad", "Project-AgML/blackgram_plant_leaf_disease_classification", "default"),
        ("turmeric", "Project-AgML/turmeric_leaf_disease_classification", "raw"),
        ("tea", "Project-AgML/teaLeafBD_disease_classification", "default"),
        ("coffee", "Project-AgML/arabica_coffee_leaf_disease_classification", "default"),
        ("sunflower", "Project-AgML/sunflower_disease_classification", "default"),
        ("jute", "Project-AgML/jute_disease_classification", "default"),
    ]

    rng = random.Random(SEED)
    tasks: List[Tuple[str, str]] = []
    buckets: Dict[str, List[str]] = {}

    for crop_slug, ds, cfg in hf_specs:
        q = urllib.parse.quote(ds, safe="")
        data = None
        url = f"https://datasets-server.huggingface.co/rows?dataset={q}&config={cfg}&split=train&offset=0&length=100"
        for attempt in range(2):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "CropGuard-Dataset/1.0"}), timeout=10) as r:
                    data = json.loads(r.read().decode("utf-8"))
                break
            except urllib.error.HTTPError as he:
                if he.code == 429 and attempt == 0:
                    time.sleep(6.0)
                else:
                    break
            except Exception:
                break

        if not data:
            print(f"[HF] {crop_slug:16s} ({ds.split('/')[1]}): skipped (rate limit/unavailable)", flush=True)
            time.sleep(2.5)
            continue

        feats = data.get("features", [])
        label_names: List[str] = []
        label_col = "label"
        for f in feats:
            if isinstance(f.get("type"), dict) and "names" in f["type"]:
                label_names = f["type"]["names"]
                label_col = f["name"]
                break
        all_rows = list(data.get("rows", []))

        for row_wrap in all_rows:
            row = row_wrap.get("row", {})
            img_obj = row.get("image")
            if not isinstance(img_obj, dict) or "src" not in img_obj:
                continue
            raw_lbl = row.get(label_col)
            if isinstance(raw_lbl, int) and 0 <= raw_lbl < len(label_names):
                lbl_name = label_names[raw_lbl]
            elif isinstance(raw_lbl, str):
                lbl_name = raw_lbl
            else:
                continue
            if any(skip in lbl_name.lower() for skip in ("background", "unknown", "other")):
                continue
            cond_key = slugify_cond(lbl_name)
            if "healthy" in cond_key or "fresh" in cond_key:
                cond_key = "healthy"
            label_dir = f"{crop_slug}__{cond_key}"
            buckets.setdefault(label_dir, []).append(img_obj["src"])

        print(f"[HF] {crop_slug:16s} ({ds.split('/')[1]}): sampled {len(all_rows)} rows, labels={len(label_names) or 'str'}", flush=True)
        time.sleep(3.5)

    for label_dir, urls in sorted(buckets.items()):
        rng.shuffle(urls)
        total = min(len(urls), TRAIN_CAP_PER_CLASS + VAL_CAP_PER_CLASS)
        if total < 6:
            continue
        n_val = max(2, min(VAL_CAP_PER_CLASS, total // 5))
        n_train = total - n_val
        for idx, url in enumerate(urls[:n_train]):
            tasks.append((url, os.path.join(OUT_ROOT, "train", label_dir, f"hf_{idx:03d}.jpg")))
        for idx, url in enumerate(urls[n_train : n_train + n_val]):
            tasks.append((url, os.path.join(OUT_ROOT, "val", label_dir, f"hf_{idx:03d}.jpg")))

    print(f"[HF] Scheduled {len(tasks)} image downloads across {len(buckets)} buckets.", flush=True)
    return tasks


def download_batch(batch_name: str, tasks: List[Tuple[str, str]]):
    if not tasks:
        return
    print(f"\n[{batch_name}] Downloading {len(tasks)} real leaf images to 224x224 JPEG...", flush=True)
    ok = 0
    fail = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        for res in ex.map(lambda pair: download_and_save(pair[0], pair[1]), tasks):
            if res:
                ok += 1
            else:
                fail += 1
            if (ok + fail) % 400 == 0:
                print(f"  [{batch_name}] Progress: {ok + fail}/{len(tasks)} (saved={ok}, failed={fail})", flush=True)
    print(f"[{batch_name}] Finished: saved={ok}, failed={fail}", flush=True)


def main():
    os.makedirs(OUT_ROOT, exist_ok=True)
    gh_tasks = schedule_github_downloads()
    download_batch("GitHub", gh_tasks)

    hf_tasks = fetch_hf_datasets()
    download_batch("HuggingFace", hf_tasks)

    train_classes = sorted(os.listdir(os.path.join(OUT_ROOT, "train"))) if os.path.exists(os.path.join(OUT_ROOT, "train")) else []
    crops_covered = sorted(set(c.split("__")[0] for c in train_classes))
    print(f"\nALL DONE! Total classes: {len(train_classes)} | Total real-photo crops: {len(crops_covered)}", flush=True)
    print("Crops:", crops_covered, flush=True)


if __name__ == "__main__":
    main()
