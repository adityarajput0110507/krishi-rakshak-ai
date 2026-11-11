from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class RiskPredictionRequest(BaseModel):
    crop_name: str
    district: str
    growth_stage: str = "Vegetative"  # Germination, Vegetative, Flowering, Boll/Grain formation, Maturity
    temperature: Optional[float] = None
    relative_humidity: Optional[float] = None
    rainfall_mm: Optional[float] = None
    soil_moisture: Optional[str] = "Moderate"
    prior_cases_nearby: Optional[int] = 0

class RiskPredictionResponse(BaseModel):
    crop_name: str
    district: str
    growth_stage: str
    target_pathogen: str
    risk_level: str  # Low, Moderate, High, Critical
    risk_probability: float  # 0.0 to 1.0
    contributing_factors: List[str]
    temperature_used: float
    humidity_used: float
    rainfall_used: float
    advisory_recommendation: str
    predicted_at: datetime

