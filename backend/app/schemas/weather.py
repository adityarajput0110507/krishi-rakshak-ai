from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class DailyForecast(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    precipitation_sum: float
    humidity_avg: float
    condition: str

class WeatherResponse(BaseModel):
    district: str
    temperature: float
    relative_humidity: float
    precipitation_mm: float
    wind_speed_kmh: float
    weather_condition: str
    is_live: bool
    observation_time: datetime
    forecast: List[DailyForecast] = []

