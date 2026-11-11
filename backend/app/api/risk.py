from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.report import CropReport
from app.schemas.risk import RiskPredictionRequest, RiskPredictionResponse
from app.services.ml_risk_service import predict_crop_risk
from app.services.weather_service import get_district_weather

router = APIRouter(prefix="/risk", tags=["Disease Risk Surveillance"])

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_risk(
    req: RiskPredictionRequest,
    db: Session = Depends(get_db)
):
    weather = get_district_weather(req.district)
    temp = req.temperature if req.temperature is not None else weather["temperature"]
    hum = req.relative_humidity if req.relative_humidity is not None else weather["relative_humidity"]
    rain = req.rainfall_mm if req.rainfall_mm is not None else weather["precipitation_mm"]

    prior_cases = db.query(CropReport).filter(
        CropReport.district == req.district,
        CropReport.crop_type.ilike(f"%{req.crop_name}%")
    ).count()

    result = predict_crop_risk(
        crop_name=req.crop_name,
        district=req.district,
        growth_stage=req.growth_stage,
        temperature=temp,
        relative_humidity=hum,
        rainfall_mm=rain,
        prior_cases=prior_cases
    )
    return result

@router.get("/location")
def get_location_risk(
    district: str = Query("Nashik"),
    crop: str = Query("cotton"),
    stage: str = Query("Vegetative"),
    db: Session = Depends(get_db)
):
    weather = get_district_weather(district)
    prior_cases = db.query(CropReport).filter(
        CropReport.district == district,
        CropReport.crop_type.ilike(f"%{crop}%")
    ).count()

    result = predict_crop_risk(
        crop_name=crop,
        district=district,
        growth_stage=stage,
        temperature=weather["temperature"],
        relative_humidity=weather["relative_humidity"],
        rainfall_mm=weather["precipitation_mm"],
        prior_cases=prior_cases
    )
    result["weather"] = weather
    return result

