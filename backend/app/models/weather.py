from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from app.database.session import Base

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(50), index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=10.0)
    weather_condition = Column(String(50), default="Clear")
    observation_time = Column(DateTime, default=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(50), index=True, nullable=False)
    crop_name = Column(String(50), nullable=False)
    target_pathogen_or_pest = Column(String(100), nullable=False)
    risk_level = Column(String(20), nullable=False)  # Low, Moderate, High, Critical
    risk_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    contributing_factors = Column(Text, nullable=False)
    recommended_advisory = Column(Text, nullable=False)
    predicted_at = Column(DateTime, default=datetime.utcnow)

