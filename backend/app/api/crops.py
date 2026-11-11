from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database.session import get_db
from app.models.crop_catalogue import (
    CropCategory,
    Crop,
    CropLocalName,
    CropSeason,
    CropRegion,
    CropDistrict,
    CropDisease,
    CropPest,
    CropDiseaseRelationship,
    CropPestRelationship,
    CultivationGuideline,
    SupportedModelClass,
    ModelVersion,
)
from app.schemas.crops import (
    CropCategoryResponse,
    CropListItemResponse,
    CropDetailResponse,
    CropDiseaseResponse,
    CropPestResponse,
    CropLocalNameResponse,
    CropSeasonResponse,
    CropRegionResponse,
    CultivationGuidelineResponse,
    SupportedClassResponse,
)

router = APIRouter(prefix="/crops", tags=["All-India Crop Catalogue"])

@router.get("/categories", response_model=List[CropCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(CropCategory).order_by(CropCategory.sort_order).all()
    results = []
    for cat in categories:
        count = db.query(Crop).filter(Crop.category_id == cat.id).count()
        results.append(CropCategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon_name=cat.icon_name,
            sort_order=cat.sort_order,
            crop_count=count
        ))
    return results

@router.get("", response_model=List[CropListItemResponse])
def list_crops(
    category: Optional[str] = Query(None, description="Category slug or name"),
    state: Optional[str] = Query(None, description="State or Union Territory name"),
    season: Optional[str] = Query(None, description="Growing season filter (Kharif, Rabi, etc.)"),
    search: Optional[str] = Query(None, description="Search crop name or scientific name"),
    ai_supported: Optional[bool] = Query(None, description="Filter AI supported crops only"),
    db: Session = Depends(get_db)
):
    query = db.query(Crop).join(CropCategory)

    if category:
        query = query.filter(
            or_(
                CropCategory.slug == category.lower(),
                CropCategory.name.ilike(f"%{category}%")
            )
        )

    if state:
        # Regionally filter by matching state in crop_regions
        crop_ids_in_state = (
            db.query(CropRegion.crop_id)
            .filter(CropRegion.state_name.ilike(f"%{state}%"))
            .subquery()
        )
        query = query.filter(Crop.id.in_(crop_ids_in_state))

    if season:
        crop_ids_in_season = (
            db.query(CropSeason.crop_id)
            .filter(CropSeason.season_name.ilike(f"%{season}%"))
            .subquery()
        )
        query = query.filter(Crop.id.in_(crop_ids_in_season))

    if search:
        s = f"%{search.strip()}%"
        # Search by crop name, scientific name, or local name
        local_crop_ids = (
            db.query(CropLocalName.crop_id)
            .filter(CropLocalName.local_name.ilike(s))
            .subquery()
        )
        query = query.filter(
            or_(
                Crop.name.ilike(s),
                Crop.scientific_name.ilike(s),
                Crop.id.in_(local_crop_ids)
            )
        )

    if ai_supported is not None:
        query = query.filter(Crop.is_ai_supported == ai_supported)

    crops = query.order_by(Crop.is_ai_supported.desc(), Crop.name.asc()).all()

    result = []
    for c in crops:
        local_names = [
            CropLocalNameResponse(
                language_code=ln.language_code,
                language_name=ln.language_name,
                local_name=ln.local_name
            )
            for ln in c.local_names
        ]
        states_list = [r.state_name for r in c.regions]

        result.append(CropListItemResponse(
            id=c.id,
            category_id=c.category_id,
            category_name=c.category.name if c.category else None,
            category_slug=c.category.slug if c.category else None,
            name=c.name,
            slug=c.slug,
            scientific_name=c.scientific_name,
            crop_image_url=c.crop_image_url,
            is_ai_supported=c.is_ai_supported,
            sowing_period=c.sowing_period,
            harvesting_period=c.harvesting_period,
            suitable_soil=c.suitable_soil,
            temp_min=c.temp_min,
            temp_max=c.temp_max,
            water_requirement_mm=c.water_requirement_mm,
            major_regions=c.major_regions,
            local_names=local_names,
            cultivated_states=states_list
        ))

    return result

@router.get("/{crop_id_or_slug}", response_model=CropDetailResponse)
def get_crop_detail(crop_id_or_slug: str, db: Session = Depends(get_db)):
    if crop_id_or_slug.isdigit():
        crop = db.query(Crop).filter(Crop.id == int(crop_id_or_slug)).first()
    else:
        crop = db.query(Crop).filter(Crop.slug == crop_id_or_slug.lower()).first()

    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found in catalogue")

    local_names = [
        CropLocalNameResponse(
            language_code=ln.language_code,
            language_name=ln.language_name,
            local_name=ln.local_name
        )
        for ln in crop.local_names
    ]

    seasons = [
        CropSeasonResponse(
            season_name=s.season_name,
            sowing_months=s.sowing_months,
            harvesting_months=s.harvesting_months,
            climate_description=s.climate_description
        )
        for s in crop.seasons
    ]

    regions = [
        CropRegionResponse(
            state_name=r.state_name,
            prominence=r.prominence,
            agro_climatic_zone=r.agro_climatic_zone,
            specific_varieties=r.specific_varieties
        )
        for r in crop.regions
    ]

    guidelines = [
        CultivationGuidelineResponse(
            topic=g.topic,
            guideline_text=g.guideline_text,
            source_organization=g.source_organization
        )
        for g in crop.cultivation_guidelines
    ]

    # Diseases linked to this crop
    diseases = []
    for rel in crop.disease_relationships:
        d = rel.disease
        diseases.append(CropDiseaseResponse(
            id=d.id,
            name=d.name,
            scientific_name=d.scientific_name,
            pathogen_type=d.pathogen_type,
            symptoms=d.symptoms,
            affected_plant_parts=d.affected_plant_parts,
            environmental_risk_factors=d.environmental_risk_factors,
            prevention_methods=d.prevention_methods,
            biological_management=d.biological_management,
            cultural_management=d.cultural_management,
            ipm_recommendations=d.ipm_recommendations,
            expert_treatment_reference=d.expert_treatment_reference,
            severity_potential=rel.severity_potential,
            is_major_threat=rel.is_major_threat
        ))

    # Pests linked to this crop
    pests = []
    for prel in crop.pest_relationships:
        p = prel.pest
        pests.append(CropPestResponse(
            id=p.id,
            name=p.name,
            scientific_name=p.scientific_name,
            pest_type=p.pest_type,
            symptoms=p.symptoms,
            affected_plant_parts=p.affected_plant_parts,
            economic_threshold_level=p.economic_threshold_level,
            environmental_risk_factors=p.environmental_risk_factors,
            prevention_methods=p.prevention_methods,
            biological_management=p.biological_management,
            cultural_management=p.cultural_management,
            ipm_recommendations=p.ipm_recommendations,
            expert_treatment_reference=p.expert_treatment_reference,
            infestation_season=prel.infestation_season,
            is_major_threat=prel.is_major_threat
        ))

    # Supported ML classes
    supported_classes = [
        SupportedClassResponse(
            id=sc.id,
            class_label=sc.class_label,
            disease_name=sc.disease_name,
            precision_score=sc.precision_score,
            recall_score=sc.recall_score,
            f1_score=sc.f1_score,
            sample_count=sc.sample_count,
            notes=sc.notes
        )
        for sc in crop.supported_classes
    ]

    return CropDetailResponse(
        id=crop.id,
        category_id=crop.category_id,
        category_name=crop.category.name if crop.category else "Uncategorized",
        category_slug=crop.category.slug if crop.category else "general",
        name=crop.name,
        slug=crop.slug,
        scientific_name=crop.scientific_name,
        description=crop.description,
        crop_image_url=crop.crop_image_url,
        is_ai_supported=crop.is_ai_supported,
        suitable_soil=crop.suitable_soil or "Information not available",
        temp_min=crop.temp_min,
        temp_max=crop.temp_max,
        water_requirement_mm=crop.water_requirement_mm or "Information not available",
        sowing_period=crop.sowing_period or "Information not available",
        harvesting_period=crop.harvesting_period or "Information not available",
        major_regions=crop.major_regions or "Information not available",
        local_names=local_names,
        seasons=seasons,
        regions=regions,
        guidelines=guidelines,
        diseases=diseases,
        pests=pests,
        supported_classes=supported_classes
    )

@router.get("/ai/supported-classes")
def list_supported_model_classes(db: Session = Depends(get_db)):
    active_version = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    classes = db.query(SupportedModelClass).all()
    
    return {
        "model_version": active_version.version_name if active_version else "v1.4",
        "architecture": active_version.architecture if active_version else "MobileNetV2",
        "overall_accuracy": active_version.overall_accuracy if active_version else 96.8,
        "supported_crops": ["Cotton", "Soybean", "Rice", "Maize"],
        "total_classes": len(classes),
        "classes": [
            {
                "crop": sc.crop_name,
                "disease": sc.disease_name,
                "label": sc.class_label,
                "precision": sc.precision_score,
                "recall": sc.recall_score,
                "f1": sc.f1_score
            }
            for sc in classes
        ]
    }

