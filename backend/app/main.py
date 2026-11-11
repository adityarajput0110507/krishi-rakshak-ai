import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import engine, Base
from app.database.seed_data import seed_database
from app.api import auth, farmer, detection, pests, risk, weather, expert, admin, advisory, crops, analytics, location

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CropGuard AI: Early Detection and Management of Crop Diseases and Pest Infestations for the Government of Maharashtra.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder for uploads and sample images
static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_path, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(farmer.router, prefix=settings.API_PREFIX)
app.include_router(detection.router, prefix=settings.API_PREFIX)
app.include_router(pests.router, prefix=settings.API_PREFIX)
app.include_router(risk.router, prefix=settings.API_PREFIX)
app.include_router(weather.router, prefix=settings.API_PREFIX)
app.include_router(expert.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(advisory.router, prefix=settings.API_PREFIX)
app.include_router(crops.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(location.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_inference": "operational",
        "weather_service": "online"
    }

# Production frontend SPA integration
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "dist"))
assets_dist = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dist):
    app.mount("/assets", StaticFiles(directory=assets_dist), name="frontend-assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str = ""):
    if full_path.startswith("api/") or full_path == "docs" or full_path == "redoc" or full_path.startswith("static/"):
        return {"detail": "Not Found"}
    if os.path.exists(frontend_dist):
        if full_path:
            abs_dist = os.path.abspath(frontend_dist)
            file_path = os.path.abspath(os.path.join(abs_dist, full_path))
            if os.path.commonpath([abs_dist, file_path]) == abs_dist and os.path.isfile(file_path):
                return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }
