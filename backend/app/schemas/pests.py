from typing import List, Optional
from pydantic import BaseModel

class BoundingBox(BaseModel):
    # Normalized coordinates [0.0 to 1.0] or pixel coords: ymin, xmin, ymax, xmax
    ymin: float
    xmin: float
    ymax: float
    xmax: float
    label: str
    confidence: float

class PestDetectionResult(BaseModel):
    pest_category: str
    scientific_name: str
    total_count: int
    crop_affected: str
    confidence: float
    economic_threshold: str
    status: str  # below_etl, at_etl, above_etl
    monitoring_actions: List[str]
    bounding_boxes: List[BoundingBox]
    image_url: str

