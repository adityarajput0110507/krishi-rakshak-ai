import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.config import settings
from app.services.ml_pest_service import detect_pests_in_image

router = APIRouter(prefix="/pests", tags=["Pest Detection"])

@router.post("/detect")
async def detect_pests(
    file: UploadFile = File(...),
    crop_hint: str = Form("cotton")
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit.")

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"pest_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    result = detect_pests_in_image(image_bytes, crop_hint)
    result["image_url"] = f"/static/uploads/{filename}"

    return result

