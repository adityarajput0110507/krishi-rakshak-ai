from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DistrictDiseaseStat(BaseModel):
    district: str
    total_reports: int
    confirmed_cases: int
    suspected_cases: int
    primary_threat: str
    risk_level: str

class CropBreakdown(BaseModel):
    crop: str
    total_scans: int
    healthy_count: int
    diseased_count: int

class AdminReportSummary(BaseModel):
    id: int
    report_code: str
    district: str
    taluka: str
    village: str
    crop: str
    condition: str
    is_healthy: bool
    severity: str
    verification_status: str
    created_at: str

class AdminDashboardStats(BaseModel):
    total_registered_farmers: int
    total_crop_reports: int
    verified_disease_cases: int
    suspected_pest_infestations: int
    expert_verification_rate: float
    crop_distribution: List[CropBreakdown]
    district_statistics: List[DistrictDiseaseStat]
    weekly_trends: List[Dict[str, Any]]
    recent_reports: List[AdminReportSummary]
