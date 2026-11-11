from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, RoleEnum
from app.models.report import CropReport, ExpertVerification, VerificationStatus
from app.schemas.expert import ExpertVerifyRequest, ExpertVerificationResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/expert", tags=["Expert Verification"])

@router.get("/pending-reports")
def get_pending_reports(
    crop: Optional[str] = None,
    current_user: User = Depends(require_role([RoleEnum.EXPERT, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(CropReport).filter(CropReport.verification_status == VerificationStatus.PENDING)
    if crop and crop.lower() != "all":
        query = query.filter(CropReport.crop_type.ilike(f"%{crop}%"))
    
    reports = query.order_by(CropReport.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "report_code": r.report_code,
            "crop": r.crop_type,
            "district": r.district,
            "taluka": r.taluka,
            "village": r.village,
            "image_url": r.image_url,
            "condition_detected": r.condition_detected,
            "is_healthy": r.is_healthy,
            "confidence": r.confidence,
            "severity": r.severity.value,
            "symptoms": r.symptoms,
            "cultural_control": r.cultural_control,
            "biological_control": r.biological_control,
            "chemical_control": r.chemical_control,
            "safety_advisory": r.safety_advisory,
            "created_at": r.created_at.isoformat()
        }
        for r in reports
    ]

@router.post("/verify/{report_id}", response_model=ExpertVerificationResponse)
def verify_report(
    report_id: int,
    verify_in: ExpertVerifyRequest,
    current_user: User = Depends(require_role([RoleEnum.EXPERT, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    report = db.query(CropReport).filter(CropReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Crop report not found.")

    # Check if existing verification
    existing = db.query(ExpertVerification).filter(ExpertVerification.report_id == report.id).first()
    if existing:
        existing.verified_condition = verify_in.verified_condition
        existing.status = verify_in.status
        existing.verified_severity = verify_in.verified_severity
        existing.expert_notes = verify_in.expert_notes
        existing.prescribed_treatment = verify_in.prescribed_treatment
        verification = existing
    else:
        verification = ExpertVerification(
            report_id=report.id,
            expert_id=current_user.id,
            verified_condition=verify_in.verified_condition,
            status=verify_in.status,
            verified_severity=verify_in.verified_severity,
            expert_notes=verify_in.expert_notes,
            prescribed_treatment=verify_in.prescribed_treatment
        )
        db.add(verification)

    # Update report status
    report.verification_status = verify_in.status
    if verify_in.status == VerificationStatus.CORRECTED:
        report.condition_detected = verify_in.verified_condition
    report.severity = verify_in.verified_severity

    db.commit()
    db.refresh(verification)

    return ExpertVerificationResponse(
        id=verification.id,
        report_id=report.id,
        expert_name=current_user.name,
        verified_condition=verification.verified_condition,
        status=verification.status,
        verified_severity=verification.verified_severity,
        expert_notes=verification.expert_notes,
        prescribed_treatment=verification.prescribed_treatment,
        verified_at=verification.verified_at
    )

