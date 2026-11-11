from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.report import VerificationStatus, SeverityEnum

class ExpertVerifyRequest(BaseModel):
    verified_condition: str
    status: VerificationStatus = VerificationStatus.VERIFIED
    verified_severity: SeverityEnum = SeverityEnum.MILD
    expert_notes: str
    prescribed_treatment: Optional[str] = None

class ExpertVerificationResponse(BaseModel):
    id: int
    report_id: int
    expert_name: str
    verified_condition: str
    status: VerificationStatus
    verified_severity: SeverityEnum
    expert_notes: str
    prescribed_treatment: Optional[str] = None
    verified_at: datetime

    class Config:
        from_attributes = True

