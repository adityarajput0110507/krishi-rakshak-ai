from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import requests

# Coordinates for all 36 Maharashtra Districts
MAHARASHTRA_DISTRICTS: Dict[str, Dict[str, Any]] = {
    "Nashik": {"lat": 19.9975, "lon": 73.7898, "division": "Nashik", "avg_temp": 28.5, "avg_hum": 72.0},
    "Pune": {"lat": 18.5204, "lon": 73.8567, "division": "Pune", "avg_temp": 27.2, "avg_hum": 68.0},
    "Nagpur": {"lat": 21.1458, "lon": 79.0882, "division": "Nagpur", "avg_temp": 32.1, "avg_hum": 62.0},
    "Amravati": {"lat": 20.9374, "lon": 77.7796, "division": "Amravati", "avg_temp": 31.4, "avg_hum": 64.0},
    "Chhatrapati Sambhajinagar": {"lat": 19.8762, "lon": 75.3433, "division": "Chhatrapati Sambhajinagar", "avg_temp": 29.8, "avg_hum": 65.0},
    "Yavatmal": {"lat": 20.3888, "lon": 78.1204, "division": "Amravati", "avg_temp": 31.8, "avg_hum": 63.0},
    "Jalgaon": {"lat": 21.0077, "lon": 75.5626, "division": "Nashik", "avg_temp": 31.2, "avg_hum": 61.0},
    "Kolhapur": {"lat": 16.7050, "lon": 74.2433, "division": "Pune", "avg_temp": 26.5, "avg_hum": 78.0},
    "Solapur": {"lat": 17.6599, "lon": 75.9064, "division": "Pune", "avg_temp": 32.5, "avg_hum": 55.0},
    "Akola": {"lat": 20.7002, "lon": 77.0082, "division": "Amravati", "avg_temp": 31.9, "avg_hum": 60.0},
    "Nanded": {"lat": 19.1383, "lon": 77.3210, "division": "Chhatrapati Sambhajinagar", "avg_temp": 30.8, "avg_hum": 66.0},
    "Satara": {"lat": 17.6805, "lon": 73.9997, "division": "Pune", "avg_temp": 26.8, "avg_hum": 74.0},
    "Sangli": {"lat": 16.8524, "lon": 74.5815, "division": "Pune", "avg_temp": 28.1, "avg_hum": 69.0},
    "Ahmednagar": {"lat": 19.0948, "lon": 74.7480, "division": "Nashik", "avg_temp": 29.0, "avg_hum": 63.0},
    "Dhule": {"lat": 20.9042, "lon": 74.7749, "division": "Nashik", "avg_temp": 30.5, "avg_hum": 59.0},
    "Nandurbar": {"lat": 21.3700, "lon": 74.2400, "division": "Nashik", "avg_temp": 30.1, "avg_hum": 62.0},
    "Buldhana": {"lat": 20.5300, "lon": 76.1800, "division": "Amravati", "avg_temp": 30.7, "avg_hum": 64.0},
    "Washim": {"lat": 20.1110, "lon": 77.1350, "division": "Amravati", "avg_temp": 31.0, "avg_hum": 65.0},
    "Wardha": {"lat": 20.7453, "lon": 78.5960, "division": "Nagpur", "avg_temp": 31.5, "avg_hum": 66.0},
    "Chandrapur": {"lat": 19.9615, "lon": 79.2961, "division": "Nagpur", "avg_temp": 33.2, "avg_hum": 68.0},
    "Gadchiroli": {"lat": 20.1800, "lon": 80.0000, "division": "Nagpur", "avg_temp": 32.0, "avg_hum": 73.0},
    "Bhandara": {"lat": 21.1700, "lon": 79.6500, "division": "Nagpur", "avg_temp": 31.0, "avg_hum": 71.0},
    "Gondia": {"lat": 21.4600, "lon": 80.2000, "division": "Nagpur", "avg_temp": 30.8, "avg_hum": 72.0},
    "Jalna": {"lat": 19.8410, "lon": 75.8860, "division": "Chhatrapati Sambhajinagar", "avg_temp": 29.5, "avg_hum": 62.0},
    "Parbhani": {"lat": 19.2608, "lon": 76.7748, "division": "Chhatrapati Sambhajinagar", "avg_temp": 31.0, "avg_hum": 64.0},
    "Hingoli": {"lat": 19.7200, "lon": 77.1500, "division": "Chhatrapati Sambhajinagar", "avg_temp": 30.5, "avg_hum": 65.0},
    "Beed": {"lat": 18.9900, "lon": 75.7600, "division": "Chhatrapati Sambhajinagar", "avg_temp": 31.2, "avg_hum": 58.0},
    "Latur": {"lat": 18.4088, "lon": 76.5604, "division": "Chhatrapati Sambhajinagar", "avg_temp": 30.9, "avg_hum": 61.0},
    "Dharashiv": {"lat": 18.1800, "lon": 76.0400, "division": "Chhatrapati Sambhajinagar", "avg_temp": 30.2, "avg_hum": 60.0},
    "Raigad": {"lat": 18.5158, "lon": 73.1822, "division": "Konkan", "avg_temp": 28.0, "avg_hum": 84.0},
    "Ratnagiri": {"lat": 16.9902, "lon": 73.3120, "division": "Konkan", "avg_temp": 28.2, "avg_hum": 86.0},
    "Sindhudurg": {"lat": 16.1200, "lon": 73.7100, "division": "Konkan", "avg_temp": 28.5, "avg_hum": 87.0},
    "Thane": {"lat": 19.2183, "lon": 72.9781, "division": "Konkan", "avg_temp": 29.1, "avg_hum": 81.0},
    "Palghar": {"lat": 19.6967, "lon": 72.7655, "division": "Konkan", "avg_temp": 28.9, "avg_hum": 82.0},
    "Mumbai City": {"lat": 18.9388, "lon": 72.8354, "division": "Konkan", "avg_temp": 29.5, "avg_hum": 79.0},
    "Mumbai Suburban": {"lat": 19.0760, "lon": 72.8777, "division": "Konkan", "avg_temp": 29.6, "avg_hum": 80.0},
    # Major Pan-India Agricultural Hubs
    "Indore": {"lat": 22.7196, "lon": 75.8577, "division": "Madhya Pradesh", "avg_temp": 29.0, "avg_hum": 60.0},
    "Bhopal": {"lat": 23.2599, "lon": 77.4126, "division": "Madhya Pradesh", "avg_temp": 28.8, "avg_hum": 62.0},
    "Ludhiana": {"lat": 30.9010, "lon": 75.8573, "division": "Punjab", "avg_temp": 27.5, "avg_hum": 66.0},
    "Amritsar": {"lat": 31.6340, "lon": 74.8723, "division": "Punjab", "avg_temp": 27.2, "avg_hum": 67.0},
    "Karnal": {"lat": 29.6857, "lon": 76.9905, "division": "Haryana", "avg_temp": 28.0, "avg_hum": 64.0},
    "Lucknow": {"lat": 26.8467, "lon": 80.9462, "division": "Uttar Pradesh", "avg_temp": 29.2, "avg_hum": 66.0},
    "Varanasi": {"lat": 25.3176, "lon": 82.9739, "division": "Uttar Pradesh", "avg_temp": 29.8, "avg_hum": 68.0},
    "Jaipur": {"lat": 26.9124, "lon": 75.7873, "division": "Rajasthan", "avg_temp": 31.0, "avg_hum": 50.0},
    "Patna": {"lat": 25.5941, "lon": 85.1376, "division": "Bihar", "avg_temp": 29.5, "avg_hum": 72.0},
    "Rajkot": {"lat": 22.3039, "lon": 70.8022, "division": "Gujarat", "avg_temp": 31.5, "avg_hum": 58.0},
    "Surat": {"lat": 21.1702, "lon": 72.8311, "division": "Gujarat", "avg_temp": 30.0, "avg_hum": 74.0},
    "Guntur": {"lat": 16.3067, "lon": 80.4365, "division": "Andhra Pradesh", "avg_temp": 30.5, "avg_hum": 70.0},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946, "division": "Karnataka", "avg_temp": 25.5, "avg_hum": 69.0},
    "Coimbatore": {"lat": 11.0168, "lon": 76.9558, "division": "Tamil Nadu", "avg_temp": 28.5, "avg_hum": 68.0},
}

WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
}

# In-memory weather cache to avoid spamming the external service
_weather_cache: Dict[str, Dict[str, Any]] = {}
CACHE_EXPIRY_SECONDS = 1800  # 30 minutes

def get_district_weather(district_name: str) -> Dict[str, Any]:
    matched_district = None
    for name in MAHARASHTRA_DISTRICTS:
        if name.lower() in district_name.lower() or district_name.lower() in name.lower():
            matched_district = name
            break
    if not matched_district:
        matched_district = "Pune"

    now = datetime.utcnow()
    cached = _weather_cache.get(matched_district)
    if cached and (now - cached["timestamp"]).total_seconds() < CACHE_EXPIRY_SECONDS:
        return cached["data"]

    coords = MAHARASHTRA_DISTRICTS[matched_district]
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={coords['lat']}&longitude={coords['lon']}&"
        f"current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&"
        f"forecast_days=7&timezone=Asia%2FKolkata"
    )

    try:
        resp = requests.get(url, timeout=4.0)
        if resp.status_code == 200:
            data = resp.json()
            curr = data.get("current", {})
            daily = data.get("daily", {})
            
            wmo_code = curr.get("weather_code", 0)
            condition_text = WMO_CODE_MAP.get(wmo_code, "Partly cloudy")
            
            forecast_list = []
            dates = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            precips = daily.get("precipitation_sum", [])
            codes = daily.get("weather_code", [])
            
            for i in range(min(7, len(dates))):
                forecast_list.append({
                    "date": dates[i],
                    "temp_max": max_temps[i] if i < len(max_temps) else 30.0,
                    "temp_min": min_temps[i] if i < len(min_temps) else 20.0,
                    "precipitation_sum": precips[i] if i < len(precips) else 0.0,
                    "humidity_avg": coords["avg_hum"],
                    "condition": WMO_CODE_MAP.get(codes[i] if i < len(codes) else 0, "Clear")
                })
            
            result = {
                "district": matched_district,
                "temperature": round(curr.get("temperature_2m", coords["avg_temp"]), 1),
                "relative_humidity": round(curr.get("relative_humidity_2m", coords["avg_hum"]), 1),
                "precipitation_mm": round(curr.get("precipitation", 0.0), 1),
                "wind_speed_kmh": round(curr.get("wind_speed_10m", 12.0), 1),
                "weather_condition": condition_text,
                "is_live": True,
                "observation_time": now.isoformat(),
                "forecast": forecast_list
            }
            _weather_cache[matched_district] = {"timestamp": now, "data": result}
            return result
    except Exception:
        pass

    # Fallback to calibrated meteorological norms for the region
    forecast_list = []
    base_date = datetime.now()
    for i in range(7):
        f_date = (base_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
        forecast_list.append({
            "date": f_date,
            "temp_max": round(coords["avg_temp"] + (1.2 if i % 2 == 0 else -0.8), 1),
            "temp_min": round(coords["avg_temp"] - 8.5, 1),
            "precipitation_sum": 0.0 if coords["avg_hum"] < 70 else 2.5,
            "humidity_avg": coords["avg_hum"],
            "condition": "Mainly clear" if coords["avg_hum"] < 70 else "Passing clouds"
        })

    fallback_result = {
        "district": matched_district,
        "temperature": coords["avg_temp"],
        "relative_humidity": coords["avg_hum"],
        "precipitation_mm": 0.0 if coords["avg_hum"] < 70 else 1.2,
        "wind_speed_kmh": 14.5,
        "weather_condition": "Partly cloudy",
        "is_live": False,
        "observation_time": now.isoformat(),
        "forecast": forecast_list
    }
    _weather_cache[matched_district] = {"timestamp": now, "data": fallback_result}
    return fallback_result

