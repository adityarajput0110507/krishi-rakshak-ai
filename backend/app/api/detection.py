import os
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User, RoleEnum
from app.models.report import CropReport, FollowUpReport, VerificationStatus, SeverityEnum
from app.schemas.detection import DiseaseReportResponse, FollowUpCreate, FollowUpResponse
from app.services.auth_service import get_current_user, get_optional_current_user
from app.services.ml_disease_service import analyze_crop_image, get_model_evaluation_metrics

router = APIRouter(prefix="/detection", tags=["Disease Detection"])

@router.post("/analyze")
async def analyze_crop(
    file: UploadFile = File(...),
    crop_type: str = Form("cotton"),
    state: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    taluka: Optional[str] = Form(None),
    village: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Validate mime type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WEBP) are supported.")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    # Save to uploads
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    image_url = f"/static/uploads/{filename}"

    # Run AI inference
    result = analyze_crop_image(image_bytes, crop_type)

    # Derive location
    user_state = state or (getattr(current_user.farmer_profile, "state", "Maharashtra") if current_user and current_user.farmer_profile else "Maharashtra")
    user_dist = district or (current_user.farmer_profile.district if current_user and current_user.farmer_profile else "Nashik")
    user_tal = taluka or (current_user.farmer_profile.taluka if current_user and current_user.farmer_profile else "Niphad")
    user_vil = village or (current_user.farmer_profile.village if current_user and current_user.farmer_profile else "Pimpalgaon")

    # Generate unique report code
    report_code = f"CG-{uuid.uuid4().hex[:8].upper()}"

    # Persist report (supports logged-in farmers and guest queries)
    if current_user:
        user_id = current_user.id
    else:
        demo_farmer = db.query(User).filter(User.role == RoleEnum.FARMER).first()
        user_id = demo_farmer.id if demo_farmer else 1
    new_report = CropReport(
        report_code=report_code,
        user_id=user_id,
        crop_type=crop_type.capitalize(),
        state=user_state,
        district=user_dist,
        taluka=user_tal,
        village=user_vil,
        latitude=latitude or 20.0,
        longitude=longitude or 73.8,
        image_url=image_url,
        condition_detected=result["condition"],
        is_healthy=result["is_healthy"],
        confidence=result["confidence"],
        severity=result["severity"],
        symptoms=result["symptoms"],
        cultural_control=result["cultural_control"],
        biological_control=result["biological_control"],
        chemical_control=result["chemical_control"],
        safety_advisory=result["safety_advisory"],
        verification_status=VerificationStatus.PENDING
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "report_id": new_report.id,
        "report_code": new_report.report_code,
        "image_url": image_url,
        "crop": result["crop"],
        "condition": result["condition"],
        "condition_key": result["condition_key"],
        "is_healthy": result["is_healthy"],
        "confidence": result["confidence"],
        "severity": result["severity"].value,
        "damage_percentage": result.get("damage_percentage", 0.0),
        "symptoms": result["symptoms"],
        "cultural_control": result["cultural_control"],
        "biological_control": result["biological_control"],
        "chemical_control": result["chemical_control"],
        "safety_advisory": result["safety_advisory"],
        "when_to_contact": result.get("when_to_contact", ""),
        "unsupported": result.get("unsupported", False),
        "verification_status": new_report.verification_status.value,
        "created_at": new_report.created_at.isoformat()
    }

@router.get("/history")
def get_reports_history(
    crop: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CropReport)
    
    if crop and crop.lower() != "all":
        query = query.filter(CropReport.crop_type.ilike(f"%{crop}%"))
        
    if status and status.lower() != "all":
        query = query.filter(CropReport.verification_status == status)
        
    if search:
        query = query.filter(
            (CropReport.report_code.ilike(f"%{search}%")) |
            (CropReport.village.ilike(f"%{search}%")) |
            (CropReport.district.ilike(f"%{search}%")) |
            (CropReport.condition_detected.ilike(f"%{search}%"))
        )

    total = query.count()
    reports = query.order_by(CropReport.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "reports": [
            {
                "id": r.id,
                "report_code": r.report_code,
                "crop": r.crop_type,
                "district": r.district,
                "taluka": r.taluka,
                "village": r.village,
                "condition": r.condition_detected,
                "is_healthy": r.is_healthy,
                "severity": r.severity.value,
                "confidence": r.confidence,
                "image_url": r.image_url,
                "verification_status": r.verification_status.value,
                "created_at": r.created_at.isoformat()
            }
            for r in reports
        ]
    }

@router.get("/metrics")
def get_metrics():
    return get_model_evaluation_metrics()

@router.get("/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    report = db.query(CropReport).filter(CropReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Crop report not found.")

    expert_data = None
    if report.verification:
        expert_data = {
            "expert_name": report.verification.expert.name if report.verification.expert else "Agronomist",
            "verified_condition": report.verification.verified_condition,
            "status": report.verification.status.value,
            "verified_severity": report.verification.verified_severity.value,
            "expert_notes": report.verification.expert_notes,
            "prescribed_treatment": report.verification.prescribed_treatment,
            "verified_at": report.verification.verified_at.isoformat()
        }

    follow_ups = [
        {
            "id": f.id,
            "observation_text": f.observation_text,
            "recovery_status": f.recovery_status,
            "image_url": f.image_url,
            "created_at": f.created_at.isoformat()
        }
        for f in report.follow_ups
    ]

    return {
        "id": report.id,
        "report_code": report.report_code,
        "crop": report.crop_type,
        "district": report.district,
        "taluka": report.taluka,
        "village": report.village,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "image_url": report.image_url,
        "condition_detected": report.condition_detected,
        "is_healthy": report.is_healthy,
        "confidence": report.confidence,
        "severity": report.severity.value,
        "symptoms": report.symptoms,
        "cultural_control": report.cultural_control,
        "biological_control": report.biological_control,
        "chemical_control": report.chemical_control,
        "safety_advisory": report.safety_advisory,
        "verification_status": report.verification_status.value,
        "created_at": report.created_at.isoformat(),
        "expert_verification": expert_data,
        "follow_up_observations": follow_ups
    }

@router.post("/{report_id}/follow-up")
def add_follow_up(
    report_id: int,
    follow_up_in: FollowUpCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(CropReport).filter(CropReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Crop report not found.")

    fu = FollowUpReport(
        report_id=report.id,
        user_id=current_user.id,
        observation_text=follow_up_in.observation_text,
        recovery_status=follow_up_in.recovery_status,
        image_url=follow_up_in.image_url
    )
    db.add(fu)
    db.commit()
    db.refresh(fu)

    return {"message": "Follow-up observation recorded successfully.", "id": fu.id}

