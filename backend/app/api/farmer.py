from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, FarmerProfile, RoleEnum
from app.models.report import CropReport
from app.schemas.auth import FarmerProfileCreate, FarmerProfileResponse
from app.services.auth_service import get_current_user, require_role
from app.services.weather_service import get_district_weather
from app.services.ml_risk_service import predict_crop_risk

router = APIRouter(prefix="/farmer", tags=["Farmer"])

@router.get("/dashboard")
def get_farmer_dashboard(
    current_user: User = Depends(require_role([RoleEnum.FARMER, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    profile = current_user.farmer_profile
    district = profile.district if profile else "Pune"
    primary_crop = profile.primary_crop if profile else "cotton"
    village = profile.village if profile else "Khed"

    # Fetch weather
    weather = get_district_weather(district)

    # Fetch prior local reports count
    local_reports = db.query(CropReport).filter(CropReport.district == district).count()

    # Calculate microclimate risk
    risk = predict_crop_risk(
        crop_name=primary_crop,
        district=district,
        growth_stage="Vegetative",
        temperature=weather["temperature"],
        relative_humidity=weather["relative_humidity"],
        rainfall_mm=weather["precipitation_mm"],
        prior_cases=local_reports
    )

    # Fetch recent user reports
    recent_reports = (
        db.query(CropReport)
        .filter(CropReport.user_id == current_user.id)
        .order_by(CropReport.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "farmer_name": current_user.name,
        "phone": current_user.phone,
        "location": {
            "district": district,
            "taluka": profile.taluka if profile else "Pune Rural",
            "village": village,
            "land_area_acres": profile.land_area_acres if profile else 2.0
        },
        "primary_crop": primary_crop,
        "weather": weather,
        "disease_risk": risk,
        "total_farmer_reports": db.query(CropReport).filter(CropReport.user_id == current_user.id).count(),
        "recent_reports": [
            {
                "id": r.id,
                "report_code": r.report_code,
                "crop": r.crop_type,
                "condition": r.condition_detected,
                "is_healthy": r.is_healthy,
                "severity": r.severity.value,
                "confidence": r.confidence,
                "verification_status": r.verification_status.value,
                "created_at": r.created_at.isoformat(),
                "image_url": r.image_url
            }
            for r in recent_reports
        ]
    }

@router.get("/profile", response_model=FarmerProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.farmer_profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return current_user.farmer_profile

@router.put("/profile", response_model=FarmerProfileResponse)
def update_profile(
    profile_in: FarmerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.farmer_profile
    if not profile:
        profile = FarmerProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.district = profile_in.district
    profile.taluka = profile_in.taluka
    profile.village = profile_in.village
    profile.land_area_acres = profile_in.land_area_acres
    profile.primary_crop = profile_in.primary_crop
    profile.preferred_language = profile_in.preferred_language
    
    db.commit()
    db.refresh(profile)
    return profile

