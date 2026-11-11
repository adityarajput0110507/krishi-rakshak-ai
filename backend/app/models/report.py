import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    CORRECTED = "corrected"
    REJECTED = "rejected"

class SeverityEnum(str, enum.Enum):
    HEALTHY = "healthy"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"

class CropReport(Base):
    __tablename__ = "crop_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String(50), nullable=False)
    state = Column(String(50), default="Maharashtra", nullable=False)
    district = Column(String(50), nullable=False)
    taluka = Column(String(50), nullable=False)
    village = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(255), nullable=False)
    
    # Diagnosis
    condition_detected = Column(String(100), nullable=False)
    is_healthy = Column(Boolean, default=False)
    confidence = Column(Float, nullable=False)
    severity = Column(Enum(SeverityEnum), default=SeverityEnum.MILD)
    symptoms = Column(Text, nullable=True)
    
    # Recommendations
    cultural_control = Column(Text, nullable=True)
    biological_control = Column(Text, nullable=True)
    chemical_control = Column(Text, nullable=True)
    safety_advisory = Column(Text, nullable=True)

    # Verification status
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reports")
    verification = relationship("ExpertVerification", back_populates="report", uselist=False, cascade="all, delete-orphan")
    follow_ups = relationship("FollowUpReport", back_populates="report", cascade="all, delete-orphan")

class ExpertVerification(Base):
    __tablename__ = "expert_verifications"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("crop_reports.id"), unique=True, nullable=False)
    expert_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verified_condition = Column(String(100), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.VERIFIED)
    verified_severity = Column(Enum(SeverityEnum), nullable=False)
    expert_notes = Column(Text, nullable=False)
    prescribed_treatment = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("CropReport", back_populates="verification")
    expert = relationship("User", back_populates="verifications")

class FollowUpReport(Base):
    __tablename__ = "follow_up_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("crop_reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    observation_text = Column(Text, nullable=False)
    recovery_status = Column(String(50), default="improving")  # improving, stationary, deteriorating
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("CropReport", back_populates="follow_ups")

