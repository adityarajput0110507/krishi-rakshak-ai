from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from app.database.session import get_db
from app.models.report import CropReport, VerificationStatus, SeverityEnum
from app.models.crop_catalogue import Crop, CropCategory, CropRegion

router = APIRouter(prefix="/analytics", tags=["Agricultural Analytics Dashboard"])

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Aggregate statistics computed directly from DB records."""
    total_reports = db.query(CropReport).count()
    verified_count = db.query(CropReport).filter(
        CropReport.verification_status.in_([VerificationStatus.VERIFIED, VerificationStatus.CORRECTED])
    ).count()
    pending_count = db.query(CropReport).filter(
        CropReport.verification_status == VerificationStatus.PENDING
    ).count()
    diseased_count = db.query(CropReport).filter(CropReport.is_healthy == False).count()
    healthy_count = db.query(CropReport).filter(CropReport.is_healthy == True).count()

    # Unique states and districts represented
    states_count = db.query(func.count(func.distinct(CropReport.state))).scalar() or 0
    districts_count = db.query(func.count(func.distinct(CropReport.district))).scalar() or 0

    return {
        "total_reports": total_reports,
        "verified_reports": verified_count,
        "pending_verification": pending_count,
        "diseased_cases": diseased_count,
        "healthy_cases": healthy_count,
        "states_monitored": states_count,
        "districts_monitored": districts_count,
        "verification_rate": round((verified_count / max(1, total_reports)) * 100, 1)
    }

@router.get("/state-reports")
def get_state_wise_reports(db: Session = Depends(get_db)):
    """State-wise breakdown of total, diseased, and verified reports."""
    stats = (
        db.query(
            CropReport.state,
            func.count(CropReport.id).label("total_reports"),
            func.sum(case((CropReport.is_healthy == False, 1), else_=0)).label("diseased"),
            func.sum(case((CropReport.verification_status == VerificationStatus.VERIFIED, 1), else_=0)).label("verified"),
            func.count(func.distinct(CropReport.district)).label("districts_count")
        )
        .group_by(CropReport.state)
        .order_by(desc("total_reports"))
        .all()
    )

    return [
        {
            "state": s[0] or "Maharashtra",
            "total_reports": s[1],
            "diseased_cases": int(s[2] or 0),
            "verified_cases": int(s[3] or 0),
            "districts_covered": int(s[4] or 0)
        }
        for s in stats
    ]

@router.get("/district-reports")
def get_district_wise_reports(
    state: Optional[str] = Query(None, description="Optional state filter"),
    db: Session = Depends(get_db)
):
    """District-level report breakdown."""
    query = db.query(
        CropReport.district,
        CropReport.state,
        func.count(CropReport.id).label("total"),
        func.sum(case((CropReport.is_healthy == False, 1), else_=0)).label("diseased"),
        func.sum(case((CropReport.verification_status == VerificationStatus.VERIFIED, 1), else_=0)).label("verified")
    )

    if state:
        query = query.filter(CropReport.state.ilike(f"%{state}%"))

    stats = query.group_by(CropReport.district, CropReport.state).order_by(desc("total")).limit(20).all()

    return [
        {
            "district": d[0],
            "state": d[1] or "Maharashtra",
            "total_reports": d[2],
            "diseased_cases": int(d[3] or 0),
            "verified_cases": int(d[4] or 0),
            "risk_level": "High" if d[2] >= 3 else "Moderate"
        }
        for d in stats
    ]

@router.get("/crop-disease-stats")
def get_crop_disease_stats(db: Session = Depends(get_db)):
    """Crop-wise breakdown of diagnosed conditions."""
    stats = (
        db.query(
            CropReport.crop_type,
            CropReport.condition_detected,
            func.count(CropReport.id).label("count"),
            func.sum(case((CropReport.severity == SeverityEnum.SEVERE, 1), else_=0)).label("severe_count")
        )
        .group_by(CropReport.crop_type, CropReport.condition_detected)
        .order_by(desc("count"))
        .all()
    )

    return [
        {
            "crop": c[0],
            "condition": c[1],
            "incidence_count": c[2],
            "severe_cases": int(c[3] or 0)
        }
        for c in stats
    ]

@router.get("/monthly-trends")
def get_monthly_trends(db: Session = Depends(get_db)):
    """Past 6 months trend of reported scans and disease incidence."""
    now = datetime.utcnow()
    trends = []
    for i in range(5, -1, -1):
        start_date = now - timedelta(days=(i+1)*30)
        end_date = now - timedelta(days=i*30)
        
        total = db.query(CropReport).filter(
            CropReport.created_at >= start_date,
            CropReport.created_at < end_date
        ).count()

        diseased = db.query(CropReport).filter(
            CropReport.created_at >= start_date,
            CropReport.created_at < end_date,
            CropReport.is_healthy == False
        ).count()

        healthy = total - diseased
        month_label = end_date.strftime("%b %Y")

        trends.append({
            "month": month_label,
            "total_reports": total,
            "diseased_cases": diseased,
            "healthy_cases": healthy
        })

    return trends

@router.get("/verification-stats")
def get_verification_stats(db: Session = Depends(get_db)):
    """Breakdown of verification statuses."""
    stats = (
        db.query(
            CropReport.verification_status,
            func.count(CropReport.id)
        )
        .group_by(CropReport.verification_status)
        .all()
    )

    return [
        {
            "status": s[0].value if hasattr(s[0], "value") else str(s[0]),
            "count": s[1]
        }
        for s in stats
    ]

