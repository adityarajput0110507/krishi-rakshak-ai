from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class CropCategory(Base):
    __tablename__ = "crop_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="Sprout")
    sort_order = Column(Integer, default=0)

    crops = relationship("Crop", back_populates="category", cascade="all, delete-orphan")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("crop_categories.id"), nullable=False)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    crop_image_url = Column(String(255), nullable=True)
    is_ai_supported = Column(Boolean, default=False)
    suitable_soil = Column(Text, nullable=True)
    temp_min = Column(Float, default=18.0)
    temp_max = Column(Float, default=32.0)
    water_requirement_mm = Column(String(100), default="600-1000 mm")
    sowing_period = Column(String(150), nullable=True)
    harvesting_period = Column(String(150), nullable=True)
    major_regions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    category = relationship("CropCategory", back_populates="crops")
    local_names = relationship("CropLocalName", back_populates="crop", cascade="all, delete-orphan")
    seasons = relationship("CropSeason", back_populates="crop", cascade="all, delete-orphan")
    regions = relationship("CropRegion", back_populates="crop", cascade="all, delete-orphan")
    districts = relationship("CropDistrict", back_populates="crop", cascade="all, delete-orphan")
    disease_relationships = relationship("CropDiseaseRelationship", back_populates="crop", cascade="all, delete-orphan")
    pest_relationships = relationship("CropPestRelationship", back_populates="crop", cascade="all, delete-orphan")
    cultivation_guidelines = relationship("CultivationGuideline", back_populates="crop", cascade="all, delete-orphan")
    supported_classes = relationship("SupportedModelClass", back_populates="crop", cascade="all, delete-orphan")

class CropLocalName(Base):
    __tablename__ = "crop_local_names"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    language_code = Column(String(20), nullable=False)  # 'hi', 'mr', 'ta', 'te', 'pa', 'gu', 'kn', 'bn', 'ml'
    language_name = Column(String(50), nullable=False)  # 'Hindi', 'Marathi', etc.
    local_name = Column(String(150), nullable=False)

    crop = relationship("Crop", back_populates="local_names")

class CropSeason(Base):
    __tablename__ = "crop_seasons"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    season_name = Column(String(50), nullable=False)  # Kharif, Rabi, Zaid, Perennial, Annual
    sowing_months = Column(String(100), nullable=True)
    harvesting_months = Column(String(100), nullable=True)
    climate_description = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="seasons")

class CropRegion(Base):
    __tablename__ = "crop_regions"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    state_name = Column(String(100), index=True, nullable=False)
    prominence = Column(String(50), default="Major")  # Major, Moderate, Minor
    agro_climatic_zone = Column(String(150), nullable=True)
    specific_varieties = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="regions")

class CropDistrict(Base):
    __tablename__ = "crop_districts"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    state_name = Column(String(100), index=True, nullable=False)
    district_name = Column(String(100), index=True, nullable=False)
    cultivation_intensity = Column(String(50), default="High")

    crop = relationship("Crop", back_populates="districts")

class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    pathogen_type = Column(String(50), default="Fungal")  # Fungal, Bacterial, Viral, Nematode
    symptoms = Column(Text, nullable=False)
    affected_plant_parts = Column(String(200), default="Leaves, Stems")
    environmental_risk_factors = Column(Text, nullable=True)
    prevention_methods = Column(Text, nullable=True)
    biological_management = Column(Text, nullable=True)
    cultural_management = Column(Text, nullable=True)
    ipm_recommendations = Column(Text, nullable=True)
    expert_treatment_reference = Column(Text, nullable=True)

    crop_relationships = relationship("CropDiseaseRelationship", back_populates="disease", cascade="all, delete-orphan")
    management_options = relationship("DiseaseManagement", back_populates="disease", cascade="all, delete-orphan")
    supported_model_classes = relationship("SupportedModelClass", back_populates="disease")

class CropPest(Base):
    __tablename__ = "crop_pests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    pest_type = Column(String(50), default="Insect")
    symptoms = Column(Text, nullable=False)
    affected_plant_parts = Column(String(200), default="Foliage, Shoots")
    economic_threshold_level = Column(String(200), nullable=True)
    environmental_risk_factors = Column(Text, nullable=True)
    prevention_methods = Column(Text, nullable=True)
    biological_management = Column(Text, nullable=True)
    cultural_management = Column(Text, nullable=True)
    ipm_recommendations = Column(Text, nullable=True)
    expert_treatment_reference = Column(Text, nullable=True)

    crop_relationships = relationship("CropPestRelationship", back_populates="pest", cascade="all, delete-orphan")
    management_options = relationship("DiseaseManagement", back_populates="pest", cascade="all, delete-orphan")

class CropDiseaseRelationship(Base):
    __tablename__ = "crop_disease_relationships"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    disease_id = Column(Integer, ForeignKey("crop_diseases.id"), nullable=False)
    severity_potential = Column(String(50), default="Moderate")  # Critical, High, Moderate, Low
    favorable_growth_stage = Column(String(100), default="Vegetative to Flowering")
    is_major_threat = Column(Boolean, default=False)

    crop = relationship("Crop", back_populates="disease_relationships")
    disease = relationship("CropDisease", back_populates="crop_relationships")

class CropPestRelationship(Base):
    __tablename__ = "crop_pest_relationships"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    pest_id = Column(Integer, ForeignKey("crop_pests.id"), nullable=False)
    infestation_season = Column(String(100), default="Kharif / Warm & Humid")
    favorable_growth_stage = Column(String(100), default="Reproductive stage")
    is_major_threat = Column(Boolean, default=False)

    crop = relationship("Crop", back_populates="pest_relationships")
    pest = relationship("CropPest", back_populates="crop_relationships")

class CultivationGuideline(Base):
    __tablename__ = "cultivation_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    topic = Column(String(100), nullable=False)  # Land Prep, Seed Treatment, Irrigation, etc.
    guideline_text = Column(Text, nullable=False)
    source_organization = Column(String(150), default="ICAR-DAC&FW Package of Practices")

    crop = relationship("Crop", back_populates="cultivation_guidelines")

class DiseaseManagement(Base):
    __tablename__ = "disease_management"

    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("crop_diseases.id"), nullable=True)
    pest_id = Column(Integer, ForeignKey("crop_pests.id"), nullable=True)
    stage = Column(String(100), default="Early Infestation")
    chemical_recommendations = Column(Text, nullable=True)
    safety_waiting_period_days = Column(Integer, default=14)
    approved_by = Column(String(150), default="Central Insecticides Board & Registration Committee (CIBRC)")

    disease = relationship("CropDisease", back_populates="management_options")
    pest = relationship("CropPest", back_populates="management_options")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(100), unique=True, nullable=False)
    architecture = Column(String(150), nullable=False)
    input_resolution = Column(String(50), default="224x224x3")
    training_dataset = Column(Text, nullable=False)
    overall_accuracy = Column(Float, default=96.5)
    overall_f1 = Column(Float, default=96.2)
    training_date = Column(String(50), default="2024-08-15")
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    supported_classes = relationship("SupportedModelClass", back_populates="model_version", cascade="all, delete-orphan")

class SupportedModelClass(Base):
    __tablename__ = "supported_model_classes"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    disease_id = Column(Integer, ForeignKey("crop_diseases.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(150), nullable=False)
    class_label = Column(String(100), nullable=False)
    precision_score = Column(Float, default=0.95)
    recall_score = Column(Float, default=0.94)
    f1_score = Column(Float, default=0.95)
    sample_count = Column(Integer, default=500)
    notes = Column(Text, nullable=True)

    model_version = relationship("ModelVersion", back_populates="supported_classes")
    crop = relationship("Crop", back_populates="supported_classes")
    disease = relationship("CropDisease", back_populates="supported_model_classes")

