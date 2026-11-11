from fastapi import APIRouter, Query
from app.services.weather_service import get_district_weather, MAHARASHTRA_DISTRICTS
from app.schemas.weather import WeatherResponse

router = APIRouter(prefix="/weather", tags=["Weather Integration"])

@router.get("/current", response_model=WeatherResponse)
def get_current(district: str = Query("Pune")):
    return get_district_weather(district)

@router.get("/forecast")
def get_forecast(district: str = Query("Pune")):
    weather = get_district_weather(district)
    return {
        "district": weather["district"],
        "forecast": weather.get("forecast", [])
    }

@router.get("/districts")
def list_districts():
    return list(MAHARASHTRA_DISTRICTS.keys())

