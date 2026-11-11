from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.database.session import Base

class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(50), index=True, nullable=False)
    disease_or_pest = Column(String(100), index=True, nullable=False)
    scientific_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=False)
    cultural_control = Column(Text, nullable=False)
    biological_control = Column(Text, nullable=False)
    chemical_control = Column(Text, nullable=False)
    safety_guidelines = Column(Text, nullable=False)
    authority_source = Column(String(100), default="ICAR & MPKV Rahuri")
    when_to_contact_officer = Column(Text, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), default="info")  # info, warning, danger, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

