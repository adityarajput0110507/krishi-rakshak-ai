import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend"))

from app.services.ml_disease_service import analyze_crop_image

def predict(image_path: str, crop_type: str = "cotton"):
    if not os.path.exists(image_path):
        print(f"Error: file {image_path} does not exist.")
        return
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    res = analyze_crop_image(image_bytes, crop_type)
    print("="*50)
    print("CropGuard AI - Inference Diagnostic Result")
    print("="*50)
    print(f"Crop:            {res['crop']}")
    print(f"Diagnosis:       {res['condition']}")
    print(f"Health Status:   {'Healthy' if res['is_healthy'] else 'Disease Detected'}")
    print(f"Confidence:      {int(res['confidence']*100)}%")
    print(f"Severity:        {res['severity'].value.capitalize()}")
    print(f"Foliar Damage:   {res['damage_percentage']}%")
    print(f"Observed Traits: {res['symptoms']}")
    print(f"Treatment (IPM): {res['chemical_control']}")
    print("="*50)

if __name__ == "__main__":
    sample_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "backend", "app", "static", "samples", "cotton_bacterial_blight.jpg"
    )
    predict(sample_file, "cotton")

