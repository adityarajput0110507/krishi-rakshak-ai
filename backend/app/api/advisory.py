from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.advisory import Advisory
from app.models.crop_catalogue import Crop, CropDisease, CropPest, CropDiseaseRelationship, CropPestRelationship
from app.services.recommendation_service import RECOMMENDATION_DATABASE

router = APIRouter(prefix="/advisories", tags=["Agricultural Advisory Hub"])

class KisanAskRequest(BaseModel):
    query: str
    language: str = "hi"

GOVT_SCHEMES = [
    {
        "id": "pm-kisan",
        "name": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        "category": "Direct Benefit Transfer",
        "benefit": "प्रति वर्ष ₹6,000 (तीन बराबर किस्तों ₹2,000 में सीधे बैंक खाते में)",
        "eligibility": "सभी छोटे और सीमांत भूमिधारक किसान परिवार।",
        "how_to_apply": "नजदीकी CSC केंद्र या pmkisan.gov.in पर आधार व खतौनी के साथ e-KYC कराएं।",
        "official_url": "https://pmkisan.gov.in",
        "helpline": "155261 / 011-24300606"
    },
    {
        "id": "pmfby",
        "name": "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
        "category": "Crop Insurance",
        "benefit": "प्राकृतिक आपदा, सूखा, बाढ़, रोग व कीट से फसल खराब होने पर पूरा बीमा मुआवजा।",
        "eligibility": "खरीफ (2% प्रीमियम), रबी (1.5% प्रीमियम), बागवानी फसल (5% प्रीमियम)।",
        "how_to_apply": "बैंक शाखा, CSC या pmfby.gov.in पर बुवाई के समय आवेदन करें।",
        "official_url": "https://pmfby.gov.in",
        "helpline": "14447"
    },
    {
        "id": "kcc",
        "name": "किसान क्रेडिट कार्ड (KCC)",
        "category": "Low-Interest Credit",
        "benefit": "केवल 4% ब्याज दर पर (समय पर भुगतान पर छूट के साथ) खेती के लिए तुरंत लोन।",
        "eligibility": "भूमि मालिक किसान, बटाईदार व पशुपालक किसान।",
        "how_to_apply": "नजदीकी राष्ट्रीयकृत या सहकारी बैंक में आधार, जमीन दस्तावेज व फोटो के साथ आवेदन करें।",
        "official_url": "https://www.myscheme.gov.in/schemes/kcc",
        "helpline": "1800-180-1551"
    },
    {
        "id": "shc",
        "name": "मृदा स्वास्थ्य कार्ड योजना (Soil Health Card)",
        "category": "Soil Testing",
        "benefit": "खेत की मिट्टी की मुफ्त जांच और संतुलित खाद/उर्वरक उपयोग की सलाह।",
        "eligibility": "देश के सभी किसान।",
        "how_to_apply": "नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से मिट्टी का सैंपल जमा कराएं।",
        "official_url": "https://soilhealth.dac.gov.in",
        "helpline": "1800-180-1551"
    },
    {
        "id": "mahadbt",
        "name": "महाडीबीटी किसान योजना (MahaDBT Agriculture)",
        "category": "Subsidy & Equipment",
        "benefit": "ड्रिप सिंचाई (80% तक सब्सिडी), ट्रैक्टर, फव्वारा पंप, खेत तालाब व पॉलीहाउस अनुदान।",
        "eligibility": "महाराष्ट्र के आधार-लिंक्ड किसान (7/12 उतारा के साथ)।",
        "how_to_apply": "mahadbt.maharashtra.gov.in पर 'फार्मर स्कीम' पोर्टल से ऑनलाइन आवेदन करें।",
        "official_url": "https://mahadbt.maharashtra.gov.in",
        "helpline": "022-49150800"
    },
    {
        "id": "enam",
        "name": "ई-नाम राष्ट्रीय कृषि बाजार (e-NAM)",
        "category": "Online Mandi & Fair Price",
        "benefit": "फसल को देश की किसी भी मंडी में ऑनलाइन बेचें — पारदर्शी बोली और सीधा पेमेंट।",
        "eligibility": "सभी किसान और FPO समूह।",
        "how_to_apply": "enam.gov.in या नजदीकी APMC मंडी काउंटर पर निःशुल्क पंजीकरण करें।",
        "official_url": "https://www.enam.gov.in",
        "helpline": "1800-270-0224"
    }
]

MANDI_RATES = [
    {"crop": "कपास (Cotton)", "msp": "₹7,521 / क्विंटल", "mandi": "यवतमाल / जलगांव", "modal_price": "₹7,650", "trend": "up"},
    {"crop": "सोयाबीन (Soybean)", "msp": "₹4,892 / क्विंटल", "mandi": "लातूर / इंदौर", "modal_price": "₹4,950", "trend": "stable"},
    {"crop": "धान / चावल (Paddy)", "msp": "₹2,320 / क्विंटल", "mandi": "भंडारा / करनाल", "modal_price": "₹2,410", "trend": "up"},
    {"crop": "गेहूं (Wheat)", "msp": "₹2,425 / क्विंटल", "mandi": "पुणे / लुधियाना", "modal_price": "₹2,540", "trend": "up"},
    {"crop": "मक्का (Maize)", "msp": "₹2,225 / क्विंटल", "mandi": "नाशिक / दावणगेरे", "modal_price": "₹2,290", "trend": "stable"},
    {"crop": "प्याज (Onion)", "msp": "बाजार आधारित (Market)", "mandi": "लासलगांव (नाशिक)", "modal_price": "₹2,850", "trend": "up"},
    {"crop": "टमाटर (Tomato)", "msp": "बाजार आधारित (Market)", "mandi": "नारायणगांव / कोलार", "modal_price": "₹1,900", "trend": "down"},
    {"crop": "चना / हरभरा (Gram)", "msp": "₹5,650 / क्विंटल", "mandi": "अकोला / जयपुर", "modal_price": "₹5,820", "trend": "up"},
    {"crop": "तूर / अरहर (Tur Dal)", "msp": "₹7,550 / क्विंटल", "mandi": "अमरावती / गुलबर्गा", "modal_price": "₹8,100", "trend": "up"},
    {"crop": "सरसों (Mustard)", "msp": "₹5,950 / क्विंटल", "mandi": "कोटा / भरतपुर", "modal_price": "₹6,080", "trend": "stable"},
    {"crop": "मूंगफली (Groundnut)", "msp": "₹6,783 / क्विंटल", "mandi": "राजकोट / सांगली", "modal_price": "₹6,910", "trend": "stable"},
    {"crop": "गन्ना (Sugarcane FRP)", "msp": "₹340 / क्विंटल (FRP)", "mandi": "कोल्हापुर / मुजफ्फरनगर", "modal_price": "₹345", "trend": "stable"}
]

@router.get("/schemes-mandi")
def get_schemes_and_mandi():
    """Returns Govt Agriculture Schemes & indicative Mandi/MSP rates."""
    return {
        "schemes": GOVT_SCHEMES,
        "mandi_rates": MANDI_RATES,
        "disclaimer": "MSP दरें भारत सरकार (2025-26) पर आधारित हैं; मंडी भाव प्रतिदिन स्थानीय APMC के अनुसार बदलते रहते हैं।"
    }

@router.post("/ask")
def ask_kisan_sahayak(payload: KisanAskRequest, db: Session = Depends(get_db)):
    """Smart multilingual Q&A assistant answering crop, disease, pest, spray, or scheme queries."""
    q = payload.query.strip().lower()
    lang = payload.language

    if not q:
        return {
            "answer": "कृपया अपनी फसल, बीमारी, कीट या सरकारी योजना के बारे में पूछें।",
            "category": "prompt",
            "links": [{"label": "रोग जांचें", "path": "/detect"}]
        }

    # 1. Check scheme / subsidy / mandi intent
    if any(k in q for k in ["yojana", "scheme", "योजना", "pm kisan", "pm-kisan", "bima", "बीमा", "kcc", "subsidy", "सब्सिडी", "लोन", "खाद"]):
        if "bima" in q or "बीमा" in q:
            s = GOVT_SCHEMES[1]
            return {"answer": f"{s['name']}: {s['benefit']} आवेदन: {s['how_to_apply']} हेल्पलाइन: {s['helpline']}", "category": "scheme", "links": [{"label": "सभी योजनाएं देखें", "path": "/schemes"}]}
        if "kcc" in q or "लोन" in q or "कर्ज" in q:
            s = GOVT_SCHEMES[2]
            return {"answer": f"{s['name']}: {s['benefit']} {s['how_to_apply']}", "category": "scheme", "links": [{"label": "सभी योजनाएं देखें", "path": "/schemes"}]}
        s = GOVT_SCHEMES[0]
        return {
            "answer": f"सरकारी योजनाओं में {s['name']} प्रमुख है — {s['benefit']} इसके अलावा फसल बीमा (PMFBY), KCC और MahaDBT अनुदान की पूरी जानकारी सरकारी योजनाएं पेज पर उपलब्ध है।",
            "category": "scheme",
            "links": [{"label": "सरकारी योजनाएं व मंडी भाव", "path": "/schemes"}]
        }

    if any(k in q for k in ["mandi", "bhav", "rate", "msp", "भाव", "मंडी", "दाम", "price"]):
        matched_rates = [r for r in MANDI_RATES if any(w in r["crop"].lower() for w in q.split() if len(w) > 2)]
        if matched_rates:
            r = matched_rates[0]
            return {
                "answer": f"{r['crop']} — सरकारी MSP: {r['msp']} | {r['mandi']} मंडी का ताज़ा भाव लगभग {r['modal_price']}/क्विंटल है।",
                "category": "mandi",
                "links": [{"label": "सभी मंडी भाव देखें", "path": "/schemes"}]
            }
        return {
            "answer": "प्रमुख फसलों के MSP व मंडी भाव: कपास ₹7,650, सोयाबीन ₹4,950, गेहूं ₹2,540, धान ₹2,410 और प्याज (लासलगांव) ₹2,850/क्विंटल। सभी भाव देखने के लिए योजनाएं व मंडी पेज खोलें।",
            "category": "mandi",
            "links": [{"label": "मंडी भाव देखें", "path": "/schemes"}]
        }

    if any(k in q for k in ["weather", "mausam", "rain", "बारिश", "मौसम", "अनुमान"]):
        return {
            "answer": "अपने जिले का 7 दिनों का लाइव मौसम और बीमारी का खतरा देखने के लिए 'मौसम व अलर्ट' पेज खोलें। तेज हवा या बारिश से पहले स्प्रे न करें।",
            "category": "weather",
            "links": [{"label": "लाइव मौसम देखें", "path": "/risk"}]
        }

    # 2. Match crop in DB (supports English & Hindi keywords)
    hindi_crop_aliases = {
        "कपास": "cotton", "कापूस": "cotton", "kapas": "cotton",
        "सोयाबीन": "soybean", "धान": "rice", "चावल": "rice", "भात": "rice",
        "मक्का": "maize", "मका": "maize", "makka": "maize",
        "गेहूं": "wheat", "गहू": "wheat", "gehu": "wheat",
        "टमाटर": "tomato", "tamatar": "tomato",
        "आलू": "potato", "बटाटा": "potato", "aloo": "potato",
        "प्याज": "onion", "कांदा": "onion", "pyaz": "onion",
        "गन्ना": "sugarcane", "ऊस": "sugarcane", "ganna": "sugarcane",
        "मिर्च": "chilli", "mirchi": "chilli", "आम": "mango", "aam": "mango",
        "सरसों": "mustard", "sarson": "mustard", "मूंगफली": "groundnut",
        "बैंगन": "brinjal", "अंगूर": "grapes", "चना": "chickpea"
    }
    search_slug = None
    for alias, eng in hindi_crop_aliases.items():
        if alias in q:
            search_slug = eng
            break

    matched_crop = None
    if search_slug:
        matched_crop = db.query(Crop).filter((Crop.slug == search_slug) | (Crop.name.ilike(f"%{search_slug}%"))).first()
    if not matched_crop:
        words = [w for w in q.replace("?", "").replace(",", "").split() if len(w) > 2]
        for w in words:
            c = db.query(Crop).filter((Crop.slug == w) | (Crop.name.ilike(f"%{w}%"))).first()
            if c:
                matched_crop = c
                break

    if matched_crop:
        disease = (
            db.query(CropDisease)
            .join(CropDiseaseRelationship, CropDisease.id == CropDiseaseRelationship.disease_id)
            .filter(CropDiseaseRelationship.crop_id == matched_crop.id)
            .first()
        )
        pest = (
            db.query(CropPest)
            .join(CropPestRelationship, CropPest.id == CropPestRelationship.pest_id)
            .filter(CropPestRelationship.crop_id == matched_crop.id)
            .first()
        )
        season_names = ", ".join(s.season_name for s in (matched_crop.seasons or []) if getattr(s, "season_name", None))
        season_label = season_names or matched_crop.sowing_period or "भारत की प्रमुख फसल"
        parts = [f"फसल: {matched_crop.name} ({season_label})।"]
        if disease:
            parts.append(f"प्रमुख रोग: {disease.name} — जैविक उपाय: {disease.biological_management or 'नीम तेल 3-5 ml/लीटर'} | दवा: {disease.ipm_recommendations}")
        if pest:
            parts.append(f"प्रमुख कीट: {pest.name} — उपचार: {pest.ipm_recommendations}")
        if not disease and not pest:
            parts.append("सही इलाज के लिए पत्ती की साफ फोटो 'रोग जांच' में अपलोड करें।")
        return {
            "answer": " ".join(parts),
            "category": "crop",
            "links": [
                {"label": f"{matched_crop.name} रोग जांचें", "path": f"/detect?crop={matched_crop.slug}"},
                {"label": "पूरी फसल जानकारी", "path": f"/crops/{matched_crop.id}"}
            ]
        }

    # 3. General guidance fallback
    if any(k in q for k in ["पत्ती", "पीला", "yellow", "leaf", "spot", "धब्बे", "सूख", "रोग", "दवाई", "कीट", "इल्ली", "insect", "worm"]):
        return {
            "answer": "पत्तों के पीले पड़ने, धब्बों या इल्ली के प्रकोप की सही पहचान के लिए कृपया 'रोग जांच' या 'कीट पहचान' में पत्ती का फोटो अपलोड करें। तुरंत जैविक सुरक्षा के लिए नीम का तेल (5 ml प्रति लीटर पानी) छिड़क सकते हैं। आपात सहायता के लिए 1800-180-1551 पर कॉल करें।",
            "category": "diagnosis",
            "links": [
                {"label": "फोटो से रोग जांचें", "path": "/detect"},
                {"label": "कीट पहचान करें", "path": "/pests"}
            ]
        }

    return {
        "answer": "आप अपनी किसी भी 92 फसलों के रोग, कीट, मौसम अलर्ट, सरकारी योजना (PM-KISAN / फसल बीमा) या मंडी भाव के बारे में पूछ सकते हैं। सही निदान के लिए पत्ती की फोटो अपलोड करें या किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।",
        "category": "general",
        "links": [
            {"label": "फसल रोग जांच", "path": "/detect"},
            {"label": "सरकारी योजनाएं व भाव", "path": "/schemes"}
        ]
    }

@router.get("")
def get_advisories(
    crop: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Advisory)
    if crop and crop.lower() != "all":
        query = query.filter(Advisory.crop.ilike(f"%{crop}%"))
    if search:
        query = query.filter(
            (Advisory.disease_or_pest.ilike(f"%{search}%")) |
            (Advisory.description.ilike(f"%{search}%")) |
            (Advisory.symptoms.ilike(f"%{search}%"))
        )
    advisories = query.all()
    
    if advisories:
        return [
            {
                "id": a.id,
                "crop": a.crop,
                "disease_or_pest": a.disease_or_pest,
                "scientific_name": a.scientific_name,
                "description": a.description,
                "symptoms": a.symptoms,
                "cultural_control": a.cultural_control,
                "biological_control": a.biological_control,
                "chemical_control": a.chemical_control,
                "safety_guidelines": a.safety_guidelines,
                "authority_source": a.authority_source,
                "when_to_contact_officer": a.when_to_contact_officer
            }
            for a in advisories
        ]

    results = []
    idx = 1
    for c_key, c_items in RECOMMENDATION_DATABASE.items():
        if crop and crop.lower() != "all" and crop.lower() not in c_key.lower():
            continue
        for d_key, d_val in c_items.items():
            if d_key == "healthy":
                continue
            if search and (search.lower() not in d_val["condition"].lower() and search.lower() not in d_val["symptoms"].lower()):
                continue
            results.append({
                "id": idx,
                "crop": c_key.capitalize(),
                "disease_or_pest": d_val["condition"],
                "scientific_name": d_val["condition"].split("(")[-1].replace(")", "") if "(" in d_val["condition"] else "Pathogen",
                "description": f"Standard management protocol for {d_val['condition']} in agro-climatic conditions.",
                "symptoms": d_val["symptoms"],
                "cultural_control": d_val["cultural"],
                "biological_control": d_val["biological"],
                "chemical_control": d_val["chemical"],
                "safety_guidelines": d_val["safety"],
                "authority_source": "ICAR, MPKV Rahuri & PDKV Akola",
                "when_to_contact_officer": d_val["contact_officer"]
            })
            idx += 1
    return results

@router.get("/{crop}")
def get_crop_advisories(crop: str, db: Session = Depends(get_db)):
    return get_advisories(crop=crop, search=None, db=db)
