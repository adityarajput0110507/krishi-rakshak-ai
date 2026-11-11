from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.report import VerificationStatus, SeverityEnum

class DiagnosisResult(BaseModel):
    crop: str
    condition: str
    is_healthy: bool
    confidence: float
    severity: SeverityEnum
    symptoms: str
    cultural_control: str
    biological_control: str
    chemical_control: str
    safety_advisory: str
    economic_threshold: Optional[str] = None
    affected_area_percentage: Optional[float] = None

class DiseaseReportResponse(BaseModel):
    id: int
    report_code: str
    crop_type: str
    district: str
    taluka: str
    village: str
    image_url: str
    condition_detected: str
    is_healthy: bool
    confidence: float
    severity: SeverityEnum
    symptoms: str
    cultural_control: str
    biological_control: str
    chemical_control: str
    safety_advisory: str
    verification_status: VerificationStatus
    created_at: datetime
    expert_notes: Optional[str] = None
    prescribed_treatment: Optional[str] = None

    class Config:
        from_attributes = True

class FollowUpCreate(BaseModel):
    observation_text: str
    recovery_status: str = "improving"
    image_url: Optional[str] = None

class FollowUpResponse(BaseModel):
    id: int
    report_id: int
    observation_text: str
    recovery_status: str
    created_at: datetime

    class Config:
        from_attributes = True

