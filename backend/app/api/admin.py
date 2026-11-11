from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.user import User, RoleEnum
from app.models.report import CropReport, ExpertVerification, VerificationStatus
from app.schemas.admin import AdminDashboardStats, AdminReportSummary, DistrictDiseaseStat, CropBreakdown
from app.services.auth_service import require_role

router = APIRouter(prefix="/admin", tags=["Government Administration"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    total_farmers = db.query(User).filter(User.role == RoleEnum.FARMER).count()
    total_reports = db.query(CropReport).count()
    verified_cases = db.query(CropReport).filter(CropReport.verification_status == VerificationStatus.VERIFIED).count()
    corrected_cases = db.query(CropReport).filter(CropReport.verification_status == VerificationStatus.CORRECTED).count()
    pest_outbreaks = db.query(CropReport).filter(CropReport.is_healthy == False).count()

    verification_rate = round(((verified_cases + corrected_cases) / max(1, total_reports)) * 100.0, 1)

    # Recent report records for statistical display & CSV export
    reports = db.query(CropReport).order_by(CropReport.created_at.desc()).limit(150).all()
    recent_reports: List[AdminReportSummary] = []
    for r in reports:
        recent_reports.append(AdminReportSummary(
            id=r.id,
            report_code=r.report_code,
            district=r.district,
            taluka=r.taluka,
            village=r.village,
            crop=r.crop_type,
            condition=r.condition_detected,
            is_healthy=r.is_healthy,
            severity=r.severity.value,
            verification_status=r.verification_status.value,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M")
        ))

    # Crop breakdown
    crop_stats = (
        db.query(
            CropReport.crop_type,
            func.count(CropReport.id).label("total"),
            func.sum(func.case((CropReport.is_healthy == True, 1), else_=0)).label("healthy")
        )
        .group_by(CropReport.crop_type)
        .all()
    )
    crop_distribution = [
        CropBreakdown(
            crop=c[0],
            total_scans=c[1],
            healthy_count=int(c[2] or 0),
            diseased_count=int(c[1] - (c[2] or 0))
        )
        for c in crop_stats
    ]
    if not crop_distribution:
        crop_distribution = [
            CropBreakdown(crop="Cotton", total_scans=0, healthy_count=0, diseased_count=0),
            CropBreakdown(crop="Soybean", total_scans=0, healthy_count=0, diseased_count=0),
            CropBreakdown(crop="Rice", total_scans=0, healthy_count=0, diseased_count=0),
            CropBreakdown(crop="Maize", total_scans=0, healthy_count=0, diseased_count=0),
        ]

    # District disease breakdown
    dist_stats = (
        db.query(
            CropReport.district,
            func.count(CropReport.id).label("total"),
            func.sum(func.case((CropReport.verification_status == VerificationStatus.VERIFIED, 1), else_=0)).label("verified"),
            func.sum(func.case((CropReport.verification_status == VerificationStatus.PENDING, 1), else_=0)).label("pending")
        )
        .group_by(CropReport.district)
        .order_by(func.count(CropReport.id).desc())
        .limit(10)
        .all()
    )
    district_statistics = [
        DistrictDiseaseStat(
            district=d[0],
            total_reports=d[1],
            confirmed_cases=int(d[2] or 0),
            suspected_cases=int(d[3] or 0),
            primary_threat="Bacterial Blight" if "Cotton" in d[0] or d[1] > 5 else "Rust Complex",
            risk_level="High" if d[1] > 10 else "Moderate"
        )
        for d in dist_stats
    ]

    # Weekly incidence trend (past 6 weeks)
    now = datetime.utcnow()
    weekly_trends = []
    for i in range(5, -1, -1):
        start_w = now - timedelta(days=(i+1)*7)
        end_w = now - timedelta(days=i*7)
        week_count = db.query(CropReport).filter(
            CropReport.created_at >= start_w,
            CropReport.created_at < end_w
        ).count()
        week_healthy = db.query(CropReport).filter(
            CropReport.created_at >= start_w,
            CropReport.created_at < end_w,
            CropReport.is_healthy == True
        ).count()
        weekly_trends.append({
            "week": f"W-{6-i}",
            "period": f"{start_w.strftime('%b %d')} - {end_w.strftime('%b %d')}",
            "total_reports": week_count,
            "diseased_cases": week_count - week_healthy,
            "healthy_cases": week_healthy
        })

    return AdminDashboardStats(
        total_registered_farmers=total_farmers,
        total_crop_reports=total_reports,
        verified_disease_cases=verified_cases + corrected_cases,
        suspected_pest_infestations=pest_outbreaks,
        expert_verification_rate=verification_rate,
        crop_distribution=crop_distribution,
        district_statistics=district_statistics,
        weekly_trends=weekly_trends,
        recent_reports=recent_reports
    )

@router.get("/reports")
def get_all_reports_for_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(CropReport).order_by(CropReport.created_at.desc()).offset(skip).limit(limit).all()
