import os
from datetime import datetime, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.user import User, FarmerProfile, RoleEnum
from app.models.crop import Crop
from app.models.report import CropReport, ExpertVerification, FollowUpReport, VerificationStatus, SeverityEnum
from app.models.advisory import Advisory
from app.services.auth_service import get_password_hash
from app.services.recommendation_service import RECOMMENDATION_DATABASE
from app.services.weather_service import MAHARASHTRA_DISTRICTS

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Always ensure crop catalogue is seeded
    from app.database.seed_crops import seed_crop_catalogue
    seed_crop_catalogue(db)

    # Check if already seeded
    admin_exists = db.query(User).filter(User.phone == "9822011001").first()
    if admin_exists:
        db.close()
        return

    print("Seeding CropGuard AI database with authentic Maharashtra agricultural records...")

    # 1. Admin Officer
    admin_user = User(
        phone="9822011001",
        email="admin@cropguard.gov.in",
        name="Dr. V. K. Deshmukh (Commissioner of Agriculture, Pune)",
        hashed_password=get_password_hash("admin123"),
        role=RoleEnum.ADMIN
    )
    db.add(admin_user)

    # 2. Agricultural Expert
    expert_user = User(
        phone="9822011002",
        email="expert@cropguard.gov.in",
        name="Dr. Sunil Patil (Senior Plant Pathologist, KVK Nashik / MPKV)",
        hashed_password=get_password_hash("expert123"),
        role=RoleEnum.EXPERT
    )
    db.add(expert_user)

    # 3. Farmers
    farmers_data = [
        {
            "name": "Ramesh Vitthal Shinde",
            "phone": "9822011003",
            "district": "Nashik",
            "taluka": "Niphad",
            "village": "Pimpalgaon Baswant",
            "crop": "cotton",
            "acres": 4.5
        },
        {
            "name": "Santosh Baburao Kadam",
            "phone": "9822011004",
            "district": "Pune",
            "taluka": "Baramati",
            "village": "Malegaon Khurd",
            "crop": "soybean",
            "acres": 3.0
        },
        {
            "name": "Ananda Narayan Deshmukh",
            "phone": "9822011005",
            "district": "Yavatmal",
            "taluka": "Darwha",
            "village": "Mahagaon",
            "crop": "cotton",
            "acres": 6.0
        },
        {
            "name": "Tukaram Ganpat More",
            "phone": "9822011006",
            "district": "Satara",
            "taluka": "Karad",
            "village": "Kasegaon",
            "crop": "rice",
            "acres": 2.5
        },
        {
            "name": "Balasaheb Shivram Jagtap",
            "phone": "9822011007",
            "district": "Chhatrapati Sambhajinagar",
            "taluka": "Vaijapur",
            "village": "Borsar",
            "crop": "maize",
            "acres": 5.2
        },
        {
            "name": "Gajanan Pandurang Bhoyar",
            "phone": "9822011008",
            "district": "Amravati",
            "taluka": "Achalpur",
            "village": "Paratwada",
            "crop": "soybean",
            "acres": 4.0
        }
    ]

    farmer_entities = []
    for f in farmers_data:
        coords = MAHARASHTRA_DISTRICTS.get(f["district"], {"lat": 19.5, "lon": 75.0})
        u = User(
            phone=f["phone"],
            name=f["name"],
            hashed_password=get_password_hash("farmer123"),
            role=RoleEnum.FARMER
        )
        db.add(u)
        db.flush()
        
        prof = FarmerProfile(
            user_id=u.id,
            district=f["district"],
            taluka=f["taluka"],
            village=f["village"],
            latitude=coords["lat"] + (0.01 * (u.id % 5)),
            longitude=coords["lon"] + (0.01 * (u.id % 5)),
            land_area_acres=f["acres"],
            primary_crop=f["crop"],
            preferred_language="mr"
        )
        db.add(prof)
        farmer_entities.append((u, prof))

    db.commit()

    # 4. Realistic Field Disease Reports across Maharashtra
    now = datetime.utcnow()
    initial_reports = [
        {
            "code": "CG-2601-NSK",
            "farmer_idx": 0,
            "crop": "Cotton",
            "condition": "Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)",
            "is_healthy": False,
            "confidence": 0.94,
            "severity": SeverityEnum.MODERATE,
            "district": "Nashik",
            "taluka": "Niphad",
            "village": "Pimpalgaon Baswant",
            "lat": 20.0832,
            "lon": 73.9856,
            "days_ago": 2,
            "status": VerificationStatus.VERIFIED,
            "expert_notes": "Confirmed Xanthomonas angular lesions. Spray Copper Oxychloride + Streptocycline immediately. Weather is favorable for rapid progression.",
            "prescription": "Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 100 mg/L (20g in 200L water/acre).",
            "image": "/static/samples/cotton_bacterial_blight.jpg"
        },
        {
            "code": "CG-2602-YTL",
            "farmer_idx": 2,
            "crop": "Cotton",
            "condition": "Cotton Leaf Curl Virus (CLCuV - Begomovirus)",
            "is_healthy": False,
            "confidence": 0.91,
            "severity": SeverityEnum.SEVERE,
            "district": "Yavatmal",
            "taluka": "Darwha",
            "village": "Mahagaon",
            "lat": 20.3120,
            "lon": 78.1450,
            "days_ago": 4,
            "status": VerificationStatus.VERIFIED,
            "expert_notes": "Upward curling and severe vein thickening verified. High whitefly population noted in Darwha block.",
            "prescription": "Spray Diafenthiuron 50% WP @ 1.2 g/liter to control vector population. Install yellow sticky traps @ 20/acre.",
            "image": "/static/samples/cotton_leaf_curl.jpg"
        },
        {
            "code": "CG-2603-AMR",
            "farmer_idx": 5,
            "crop": "Soybean",
            "condition": "Asian Soybean Rust (Phakopsora pachyrhizi)",
            "is_healthy": False,
            "confidence": 0.93,
            "severity": SeverityEnum.MODERATE,
            "district": "Amravati",
            "taluka": "Achalpur",
            "village": "Paratwada",
            "lat": 21.2980,
            "lon": 77.5120,
            "days_ago": 1,
            "status": VerificationStatus.PENDING,
            "expert_notes": None,
            "prescription": None,
            "image": "/static/samples/soybean_rust.jpg"
        },
        {
            "code": "CG-2604-STR",
            "farmer_idx": 3,
            "crop": "Rice",
            "condition": "Rice Blast (Magnaporthe oryzae)",
            "is_healthy": False,
            "confidence": 0.95,
            "severity": SeverityEnum.MILD,
            "district": "Satara",
            "taluka": "Karad",
            "village": "Kasegaon",
            "lat": 17.1520,
            "lon": 74.2250,
            "days_ago": 3,
            "status": VerificationStatus.VERIFIED,
            "expert_notes": "Early spindle-shaped foliar blast diagnosed at tillering. High humidity along Krishna river basin.",
            "prescription": "Foliar spray of Tricyclazole 75% WP @ 0.6 g/liter (120g/acre) in 200 liters of water.",
            "image": "/static/samples/rice_blast.jpg"
        },
        {
            "code": "CG-2605-CSN",
            "farmer_idx": 4,
            "crop": "Maize",
            "condition": "Northern Corn Leaf Blight - NCLB (Exserohilum turcicum)",
            "is_healthy": False,
            "confidence": 0.89,
            "severity": SeverityEnum.MILD,
            "district": "Chhatrapati Sambhajinagar",
            "taluka": "Vaijapur",
            "village": "Borsar",
            "lat": 19.9210,
            "lon": 74.7340,
            "days_ago": 6,
            "status": VerificationStatus.PENDING,
            "expert_notes": None,
            "prescription": None,
            "image": "/static/samples/maize_leaf_blight.jpg"
        },
        {
            "code": "CG-2606-PUN",
            "farmer_idx": 1,
            "crop": "Soybean",
            "condition": "Healthy Soybean Crop",
            "is_healthy": True,
            "confidence": 0.96,
            "severity": SeverityEnum.HEALTHY,
            "district": "Pune",
            "taluka": "Baramati",
            "village": "Malegaon Khurd",
            "lat": 18.1560,
            "lon": 74.5820,
            "days_ago": 5,
            "status": VerificationStatus.VERIFIED,
            "expert_notes": "Healthy foliage verified. Maintain current balanced fertilizer application.",
            "prescription": "No chemical application required.",
            "image": "/static/samples/soybean_healthy.jpg"
        }
    ]

    for rep in initial_reports:
        farmer_user, _ = farmer_entities[rep["farmer_idx"]]
        c_rec = RECOMMENDATION_DATABASE[rep["crop"].lower()].get("bacterial_blight" if "Bacterial" in rep["condition"] else "rust" if "Rust" in rep["condition"] else "healthy")
        if not c_rec:
            c_rec = RECOMMENDATION_DATABASE["cotton"]["healthy"]

        r_obj = CropReport(
            report_code=rep["code"],
            user_id=farmer_user.id,
            crop_type=rep["crop"],
            district=rep["district"],
            taluka=rep["taluka"],
            village=rep["village"],
            latitude=rep["lat"],
            longitude=rep["lon"],
            image_url=rep["image"],
            condition_detected=rep["condition"],
            is_healthy=rep["is_healthy"],
            confidence=rep["confidence"],
            severity=rep["severity"],
            symptoms=c_rec["symptoms"],
            cultural_control=c_rec["cultural"],
            biological_control=c_rec["biological"],
            chemical_control=c_rec["chemical"],
            safety_advisory=c_rec["safety"],
            verification_status=rep["status"],
            created_at=now - timedelta(days=rep["days_ago"])
        )
        db.add(r_obj)
        db.flush()

        if rep["status"] == VerificationStatus.VERIFIED and rep["expert_notes"]:
            exp_ver = ExpertVerification(
                report_id=r_obj.id,
                expert_id=expert_user.id,
                verified_condition=rep["condition"],
                status=VerificationStatus.VERIFIED,
                verified_severity=rep["severity"],
                expert_notes=rep["expert_notes"],
                prescribed_treatment=rep["prescription"],
                verified_at=now - timedelta(days=rep["days_ago"] - 1)
            )
            db.add(exp_ver)

            # Add sample follow-up
            if rep["farmer_idx"] == 0:
                fu = FollowUpReport(
                    report_id=r_obj.id,
                    user_id=farmer_user.id,
                    observation_text="Sprayed Copper Oxychloride + Streptocycline as instructed 2 days ago. New emerging leaves look healthy and lesion spread has halted.",
                    recovery_status="improving",
                    created_at=now - timedelta(hours=12)
                )
                db.add(fu)

    db.commit()

    # 5. Populate Official Advisories
    for c_key, diseases in RECOMMENDATION_DATABASE.items():
        for d_key, data in diseases.items():
            if d_key == "healthy":
                continue
            adv = Advisory(
                crop=c_key.capitalize(),
                disease_or_pest=data["condition"],
                scientific_name=data["condition"].split("(")[-1].replace(")", "") if "(" in data["condition"] else "Pathogen",
                description=f"Standard agricultural operating procedure for {data['condition']} in Maharashtra.",
                symptoms=data["symptoms"],
                cultural_control=data["cultural"],
                biological_control=data["biological"],
                chemical_control=data["chemical"],
                safety_guidelines=data["safety"],
                authority_source="ICAR, MPKV Rahuri, PDKV Akola & VNMKV Parbhani",
                when_to_contact_officer=data["contact_officer"]
            )
            db.add(adv)

    db.commit()
    db.close()
    print("CropGuard AI database seeded successfully!")

