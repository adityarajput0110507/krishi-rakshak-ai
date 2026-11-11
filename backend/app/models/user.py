import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class RoleEnum(str, enum.Enum):
    FARMER = "farmer"
    EXPERT = "expert"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.FARMER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("CropReport", back_populates="user")
    verifications = relationship("ExpertVerification", back_populates="expert")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    state = Column(String(50), default="Maharashtra", nullable=False)
    district = Column(String(50), nullable=False)
    taluka = Column(String(50), nullable=False)
    village = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    land_area_acres = Column(Float, default=2.0)
    primary_crop = Column(String(50), default="cotton")
    soil_type = Column(String(50), default="Black Cotton Soil (Regur)")
    preferred_language = Column(String(10), default="mr")

    user = relationship("User", back_populates="farmer_profile")

