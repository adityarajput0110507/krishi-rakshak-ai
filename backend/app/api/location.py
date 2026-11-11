from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.india_location_service import get_all_states, get_districts_for_state
from app.models.crop_catalogue import Crop, CropRegion

router = APIRouter(prefix="/location", tags=["India Regional Location"])

@router.get("/states", response_model=List[str])
def list_states():
    """Returns list of all 28 States and 8 Union Territories in India."""
    return get_all_states()

@router.get("/districts", response_model=List[str])
def list_districts(state: str = Query(..., description="Name of the State or Union Territory")):
    """Returns list of districts within the specified State or Union Territory."""
    return get_districts_for_state(state)

@router.get("/crops")
def list_state_crops(
    state: str = Query(..., description="Selected State or UT"),
    db: Session = Depends(get_db)
):
    """
    Returns database-driven prioritized list of crops cultivated in the selected state.
    """
    regions = (
        db.query(CropRegion)
        .filter(CropRegion.state_name.ilike(f"%{state}%"))
        .all()
    )
    crop_ids = [r.crop_id for r in regions]
    
    if crop_ids:
        crops = db.query(Crop).filter(Crop.id.in_(crop_ids)).all()
    else:
        # Fallback to major staple crops
        crops = db.query(Crop).limit(20).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "scientific_name": c.scientific_name,
            "category_id": c.category_id,
            "is_ai_supported": c.is_ai_supported,
            "sowing_period": c.sowing_period,
            "harvesting_period": c.harvesting_period,
            "crop_image_url": c.crop_image_url
        }
        for c in crops
    ]

