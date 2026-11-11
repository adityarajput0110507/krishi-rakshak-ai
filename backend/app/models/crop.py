from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.crop_catalogue import Crop

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="Primary Plot")
    crop_name = Column(String(50), nullable=False)
    area_acres = Column(Float, default=2.0)
    sowing_date = Column(DateTime, default=datetime.utcnow)
    growth_stage = Column(String(50), default="Vegetative")
    state = Column(String(50), default="Maharashtra")
    district = Column(String(50), nullable=False)
    taluka = Column(String(50), nullable=False)
    village = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
