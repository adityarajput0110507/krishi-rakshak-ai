from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CropCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: str
    sort_order: int
    crop_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CropLocalNameResponse(BaseModel):
    language_code: str
    language_name: str
    local_name: str

class CropSeasonResponse(BaseModel):
    season_name: str
    sowing_months: Optional[str] = None
    harvesting_months: Optional[str] = None
    climate_description: Optional[str] = None

class CropRegionResponse(BaseModel):
    state_name: str
    prominence: str
    agro_climatic_zone: Optional[str] = None
    specific_varieties: Optional[str] = None

class CultivationGuidelineResponse(BaseModel):
    topic: str
    guideline_text: str
    source_organization: str

class CropDiseaseResponse(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str] = None
    pathogen_type: str
    symptoms: str
    affected_plant_parts: str
    environmental_risk_factors: Optional[str] = None
    prevention_methods: Optional[str] = None
    biological_management: Optional[str] = None
    cultural_management: Optional[str] = None
    ipm_recommendations: Optional[str] = None
    expert_treatment_reference: Optional[str] = None
    severity_potential: Optional[str] = "Moderate"
    is_major_threat: Optional[bool] = False

class CropPestResponse(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str] = None
    pest_type: str
    symptoms: str
    affected_plant_parts: str
    economic_threshold_level: Optional[str] = None
    environmental_risk_factors: Optional[str] = None
    prevention_methods: Optional[str] = None
    biological_management: Optional[str] = None
    cultural_management: Optional[str] = None
    ipm_recommendations: Optional[str] = None
    expert_treatment_reference: Optional[str] = None
    infestation_season: Optional[str] = None
    is_major_threat: Optional[bool] = False

class SupportedClassResponse(BaseModel):
    id: int
    class_label: str
    disease_name: str
    precision_score: float
    recall_score: float
    f1_score: float
    sample_count: int
    notes: Optional[str] = None

class CropListItemResponse(BaseModel):
    id: int
    category_id: int
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    name: str
    slug: str
    scientific_name: Optional[str] = None
    crop_image_url: Optional[str] = None
    is_ai_supported: bool
    sowing_period: Optional[str] = None
    harvesting_period: Optional[str] = None
    suitable_soil: Optional[str] = None
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    water_requirement_mm: Optional[str] = None
    major_regions: Optional[str] = None
    local_names: List[CropLocalNameResponse] = []
    cultivated_states: List[str] = []

    class Config:
        from_attributes = True

class CropDetailResponse(BaseModel):
    id: int
    category_id: int
    category_name: str
    category_slug: str
    name: str
    slug: str
    scientific_name: Optional[str] = None
    description: Optional[str] = None
    crop_image_url: Optional[str] = None
    is_ai_supported: bool
    suitable_soil: Optional[str] = None
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    water_requirement_mm: Optional[str] = None
    sowing_period: Optional[str] = None
    harvesting_period: Optional[str] = None
    major_regions: Optional[str] = None
    local_names: List[CropLocalNameResponse] = []
    seasons: List[CropSeasonResponse] = []
    regions: List[CropRegionResponse] = []
    guidelines: List[CultivationGuidelineResponse] = []
    diseases: List[CropDiseaseResponse] = []
    pests: List[CropPestResponse] = []
    supported_classes: List[SupportedClassResponse] = []

