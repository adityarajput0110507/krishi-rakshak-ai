from typing import Dict, Any, Optional

RECOMMENDATION_DATABASE: Dict[str, Dict[str, Any]] = {
    "cotton": {
        "healthy": {
            "condition": "Healthy Cotton Foliage",
            "symptoms": "Vibrant deep green foliage, erect stem, no angular water-soaked lesions or boll discoloration.",
            "cultural": "Maintain optimal row-to-row spacing (90x60 cm or 120x45 cm). Practice clean cultivation, eradicate alternate weed hosts (Abutilon indicum).",
            "biological": "Conserve predatory spiders, ladybird beetles (Coccinella septempunctata), and green lacewings (Chrysoperla carnea).",
            "chemical": "No chemical application required. Avoid prophylactic pesticide spray to preserve natural beneficial insect bio-agents.",
            "safety": "Standard agricultural occupational safety. Keep field channels free from stagnant water.",
            "contact_officer": "Report normal crop phenology at 45 and 90 DAS (Days After Sowing) through CropGuard AI."
        },
        "bacterial_blight": {
            "condition": "Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)",
            "symptoms": "Small, angular, water-soaked translucent lesions bounded by leaf veinlets, progressing into dark brown angular spots with greasy appearance. Also causes black arm on stems.",
            "cultural": "Collect and burn infected crop residues post-harvest. Avoid high density sowing and excessive early nitrogenous fertilization.",
            "biological": "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed. Foliar application of bio-fungicide Bacillus subtilis @ 5g/liter at early vegetative stage.",
            "chemical": "Spray Copper Oxychloride 50% WP @ 2.5-3.0 g/liter (500g in 200L water/acre) mixed with Streptocycline (90:10 Streptomycin sulphate + Tetracycline hydrochloride) @ 100 mg/liter (20g/acre). Repeat after 12-15 days if cloudy humid weather persists.",
            "safety": "Pre-Harvest Interval (PHI): 15 days. Use protective face mask, rubber gloves, and spray during early morning or late afternoon when wind is calm.",
            "contact_officer": "If angular lesions spread across >20% of the upper canopy or black arm stem lesions cause lodging, immediately alert your Taluka Agriculture Officer (TAO)."
        },
        "boll_rot": {
            "condition": "Cotton Boll Rot Complex (Colletotrichum / Fusarium / Rhizopus)",
            "symptoms": "Water-soaked dark lesions on green bolls, premature drying, failure of boll opening, lint discoloration, fungal mycelial growth inside locules.",
            "cultural": "Avoid excessive vegetative canopy through apical pinching. Ensure adequate aeration and drainage in black soils (regur).",
            "biological": "Trichoderma harzianum soil application @ 2.5 kg/ha enriched in 500 kg well-decomposed FYM (Farm Yard Manure).",
            "chemical": "Foliar spray of Mancozeb 75% WP @ 2.5 g/liter (500g/acre) or Carbendazim 12% + Mancozeb 63% WP @ 2g/liter in 200 liters of water.",
            "safety": "PHI: 20 days. Do not spray during peak boll opening to prevent lint staining.",
            "contact_officer": "Escalate to KVK if internal boll rot exceeds 10% in sample boll counts across 20 randomly tagged plants."
        },
        "leaf_curl_virus": {
            "condition": "Cotton Leaf Curl Virus (CLCuV - Begomovirus)",
            "symptoms": "Upward or downward curling of leaf margins, thickening of primary and secondary veins, cup-shaped enation on lower leaf surface, stunting.",
            "cultural": "Eradicate alternate weed hosts such as Parthenium hysterophorus, Xanthium strumarium. Plant tolerant Bt-hybrids recommended by MPKV/PDKV.",
            "biological": "Conserve Encarsia sophia and Chrysoperla carnea to suppress whitefly vector population naturally. Install yellow sticky traps @ 15-20 traps/acre.",
            "chemical": "Target the vector (Bemisia tabaci): Spray Diafenthiuron 50% WP @ 1.2 g/liter (240g/acre) or Flonicamid 50% WG @ 0.3g/liter (60g/acre in 200L water).",
            "safety": "PHI: 30 days. Rotate insecticide classes to avoid rapid whitefly resistance development. Wear respirator and protective glasses.",
            "contact_officer": "Notify agricultural department immediately if vector population exceeds Economic Threshold Level (>6-8 whiteflies/leaf)."
        }
    },
    "soybean": {
        "healthy": {
            "condition": "Healthy Soybean Crop",
            "symptoms": "Trifoliate leaves uniform dark emerald green, nodulation robust on root system, absence of rust pustules or mosaic chlorosis.",
            "cultural": "Maintain 45x5 cm seed drill spacing. Ensure ridge and furrow sowing to prevent waterlogging during heavy monsoon spells.",
            "biological": "Seed treatment with Rhizobium japonicum and PSB (Phosphate Solubilizing Bacteria) @ 250g per 10kg seed.",
            "chemical": "No chemical treatment recommended.",
            "safety": "Inspect field weekly during pod initiation stage (R3).",
            "contact_officer": "Record crop health stage in CropGuard AI."
        },
        "rust": {
            "condition": "Asian Soybean Rust (Phakopsora pachyrhizi)",
            "symptoms": "Minute polygonal, water-soaked chlorotic spots on lower leaf surface, developing into raised tan-to-reddish-brown eruptive uredinial pustules, premature defoliation.",
            "cultural": "Sow early-maturing varieties (JS 93-05, JS 335, Phule Agrani). Avoid dense planting that restricts airflow in the lower canopy.",
            "biological": "Foliar spray of Trichoderma viride @ 5g/liter at onset of monsoon humidity (>85% RH for 3 consecutive days).",
            "chemical": "Prophylactic or early therapeutic spray of Hexaconazole 5% EC @ 2 ml/liter (400 ml in 200L water/acre) or Tebuconazole 25.9% EC @ 1.25 ml/liter (250 ml/acre).",
            "safety": "PHI: 25 days. Ensure full coverage of the lower leaf canopy where the pathogen first establishes.",
            "contact_officer": "Soybean rust spreads aggressively through wind-borne urediniospores; report suspected rust within 24 hours to the KVK plant pathologist."
        },
        "frogeye_leaf_spot": {
            "condition": "Frogeye Leaf Spot (Cercospora sojina)",
            "symptoms": "Circular or angular lesions (1-5 mm) with pale gray-to-white centers bordered by a narrow, dark reddish-brown margin on foliage and pods.",
            "cultural": "Practice two-year crop rotation with non-host graminaceous crops (maize, sorghum). Plow under infected crop residue thoroughly.",
            "biological": "Seed treatment with Trichoderma asperellum @ 6g/kg seed.",
            "chemical": "Foliar application of Pyraclostrobin 20% WG @ 1g/liter (200g/acre) or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/liter.",
            "safety": "PHI: 21 days. Do not spray within 3 weeks of pod maturity.",
            "contact_officer": "Contact local agriculture extension worker if lesions appear on developing green pods (R4 stage)."
        },
        "yellow_mosaic_virus": {
            "condition": "Soybean Yellow Mosaic Virus (YMV - Begomovirus)",
            "symptoms": "Alternating irregular bright yellow and green patches on leaves, leaf crinkling, reduced leaf size, stunted plant growth, fewer seed pods.",
            "cultural": "Rogue out and destroy initial infected plants within 20 days of germination. Grow resistant varieties such as NRC 37, JS 97-52, Phule Kalyani.",
            "biological": "Install yellow sticky traps @ 12 traps/acre to monitor whitefly vector movement.",
            "chemical": "Control whitefly vector: Seed treatment with Thiamethoxam 30% FS @ 10 ml/kg seed, followed by foliar spray of Acetamiprid 20% SP @ 0.3 g/liter.",
            "safety": "PHI: 21 days. Handle treated seeds with gloves. Do not feed treated foliage to milch animals.",
            "contact_officer": "Report outbreak if yellow mosaic affects >15% of the seedling stand."
        }
    },
    "rice": {
        "healthy": {
            "condition": "Healthy Paddy / Rice",
            "symptoms": "Tillering vigorous, leaves upright and clean with no spindle lesions or bacterial ooze, healthy pale cream root system.",
            "cultural": "Maintain alternate wetting and drying (AWD) water management. Apply balanced NPK (100:50:50 kg/ha) with Split N (Basal, Tillering, Panicle Initiation).",
            "biological": "Apply Azospirillum and Phosphobacteria biofertilizers. Maintain natural refuge for damselflies and predatory mirid bugs.",
            "chemical": "No chemical treatment needed.",
            "safety": "Monitor water depth consistently at 2-3 cm.",
            "contact_officer": "Upload vegetative phase status."
        },
        "blast": {
            "condition": "Rice Blast (Magnaporthe oryzae)",
            "symptoms": "Spindle-shaped elliptical lesions with gray or whitish centers and brown-to-reddish borders on leaf blades. Can cause neck blast and node rotting.",
            "cultural": "Avoid excessive nitrogen application; split doses of nitrogen fertilizer into 3-4 applications. Ensure timely weed management.",
            "biological": "Seed treatment with Pseudomonas fluorescens @ 10g/kg and seedling dip @ 2.5 kg/ha in 100L water for 30 minutes before transplanting.",
            "chemical": "Spray Tricyclazole 75% WP @ 0.6 g/liter (120g in 200L water/acre) or Isoprothiolane 40% EC @ 1.5 ml/liter at first sign of leaf lesions or prior to heading for neck blast prevention.",
            "safety": "PHI: 30 days. Never mix tricyclazole with alkaline foliar fertilizers.",
            "contact_officer": "Alert district agricultural officer immediately if neck blast symptoms (blackish ring at panicle base) appear before grain filling."
        },
        "bacterial_leaf_blight": {
            "condition": "Bacterial Leaf Blight - BLB (Xanthomonas oryzae pv. oryzae)",
            "symptoms": "Water-soaked stripes starting at leaf tips and margins, expanding into yellowish-white lesions with wavy margins. Milky bacterial ooze droplets appear in early morning.",
            "cultural": "Drain standing water from infected fields for 48-72 hours. Avoid clipping seedling tips during transplanting. Reduce top-dressed urea.",
            "biological": "Apply bio-control agent Bacillus amyloliquefaciens @ 5g/liter.",
            "chemical": "Spray Copper Hydroxide 77% WP @ 2.0 g/liter mixed with Streptocycline @ 60 mg/liter (12g in 200L water/acre).",
            "safety": "PHI: 15 days. Spray after dew has dried up on foliage to prevent bacterial splash dissemination.",
            "contact_officer": "If kresek (seedling wilting) phase is observed within 3 weeks of transplanting, request KVK diagnostic field visit."
        },
        "brown_spot": {
            "condition": "Brown Spot (Bipolaris oryzae / Helminthosporium oryzae)",
            "symptoms": "Small, circular-to-oval sesame-seed-like dark brown spots on leaves, surrounded by yellow halos; on glumes causes black speckling and poor grain filling.",
            "cultural": "Improve soil fertility through balanced fertilization and zinc sulphate application (25 kg/ha). Prevent water stress during tillering.",
            "biological": "Seed treatment with Trichoderma harzianum @ 10g/kg seed.",
            "chemical": "Foliar spray of Mancozeb 75% WP @ 2.0-2.5 g/liter (500g/acre) or Propiconazole 25% EC @ 1 ml/liter.",
            "safety": "PHI: 20 days. Ensure spray penetrates the lower canopy tillers.",
            "contact_officer": "Notify agricultural officer if brown spot co-occurs with suspected zinc or silicon soil deficiencies."
        }
    },
    "maize": {
        "healthy": {
            "condition": "Healthy Maize Crop",
            "symptoms": "Broad dark green leaves with clear venation, vigorous whorl growth, sturdy stalk, no chlorotic streaks or pustules.",
            "cultural": "Sow in ridges and furrows at 60x20 cm. Apply recommended basal fertilizers with micronutrient zinc supplementation.",
            "biological": "Conserve predatory spiders, earwigs (Chelisoches morio), and trichogramma egg parasitoids.",
            "chemical": "No chemical application required.",
            "safety": "Routine scouting at knee-high and tasseling stages.",
            "contact_officer": "Report normal phenological milestones."
        },
        "common_rust": {
            "condition": "Common Rust (Puccinia sorghi)",
            "symptoms": "Golden-brown to cinnamon-brown powdery pustules (uredinia) scattered across upper and lower surfaces of leaves, leaves turn chlorotic and necrotic prematurely.",
            "cultural": "Plant rust-tolerant hybrid cultivars adapted to Maharashtra kharif/rabi seasons. Avoid late sowing in cool elevated tracts (Satara, Kolhapur, Pune).",
            "biological": "Foliar application of bio-fungicide Ampelomyces quisqualis (hyper-parasite of rust fungi) @ 5g/liter.",
            "chemical": "Foliar spray of Azoxystrobin 11% + Tebuconazole 18.3% SC @ 1.5 ml/liter or Mancozeb 75% WP @ 2.5 g/liter.",
            "safety": "PHI: 25 days. Apply before rust pustules cover more than 5% leaf area on ear leaves.",
            "contact_officer": "Contact local extension officer if rust infection occurs prior to flowering/silking stage."
        },
        "northern_leaf_blight": {
            "condition": "Northern Corn Leaf Blight - NCLB (Exserohilum turcicum)",
            "symptoms": "Long, elliptical, grayish-green or tan cigar-shaped lesions (2.5 - 15 cm long) with distinctive pointed ends, coalescing to produce extensive leaf blighting.",
            "cultural": "Incorporate crop residues into the soil. Rotate with non-grasses (soybean, groundnut). Manage plant density to maximize leaf drying.",
            "biological": "Seed inoculation with Bacillus subtilis formulation.",
            "chemical": "Spray Mancozeb 75% WP @ 2.5 g/liter (500g/acre) or Propiconazole 25% EC @ 1 ml/liter at onset of earliest lower leaf lesions.",
            "safety": "PHI: 21 days. Thoroughly wet both upper and lower leaf surfaces.",
            "contact_officer": "Escalate if cigar-shaped lesions reach ear leaf prior to kernel denting stage."
        },
        "gray_leaf_spot": {
            "condition": "Gray Leaf Spot (Cercospora zeae-maydis)",
            "symptoms": "Small, rectangular lesions strictly restricted by leaf veins, expanding into long gray-to-tan rectangular blocks, causing premature leaf scorching.",
            "cultural": "Deep plowing of corn stubble. Practice crop rotation with leguminous pulses.",
            "biological": "Application of Trichoderma-enriched organic mulch.",
            "chemical": "Foliar spray of Trifloxystrobin 25% + Tebuconazole 50% WG @ 0.7 g/liter (140g in 200L water/acre).",
            "safety": "PHI: 28 days. Follow resistance management guidelines.",
            "contact_officer": "Report severe rectangular lesions spreading upwards into ear-leaf zone."
        }
    }
}

PEST_DATABASE: Dict[str, Dict[str, Any]] = {
    "pink_bollworm": {
        "common_name": "Pink Bollworm",
        "scientific_name": "Pectinophora gossypiella",
        "target_crops": ["Cotton"],
        "etl": "8 moths/trap/night for 3 consecutive nights OR 1 larva/10 bolls (10% rosette flowers or green boll damage)",
        "monitoring": [
            "Install pheromone traps with Gossyplure septa @ 5 traps/acre at 45 DAS for surveillance, @ 15 traps/acre for mass trapping.",
            "Inspect 20 green bolls (approx 20-25 days old) weekly; check for entry holes sealed by resinous secretions.",
            "Collect and destroy rosette flowers (typical rosette bloom appearance caused by larval silk webbing)."
        ],
        "biological": "Release egg parasitoid Trichogrammatoidea bactrae @ 60,000 eggs/acre at weekly intervals (3-4 releases). Foliar spray of Beauveria bassiana @ 5g/liter.",
        "chemical": "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/liter (60 ml/acre) or Emamectin Benzoate 5% SG @ 0.5 g/liter (100g/acre) in 200L water. PHI: 14 days."
    },
    "fall_armyworm": {
        "common_name": "Fall Armyworm (FAW)",
        "scientific_name": "Spodoptera frugiperda",
        "target_crops": ["Maize", "Sorghum", "Rice"],
        "etl": "5% damaged plants in seedling-to-early whorl stage; 10% damaged plants in mid whorl; 1 egg mass per 10 plants",
        "monitoring": [
            "Install FAW sex pheromone traps @ 4-5 traps/acre at emergence.",
            "Examine whorls for characteristic inverted 'Y' suture on the larval head and four dark spots arranged in a square on the 8th abdominal segment.",
            "Check for windowing on tender leaves and prominent sawdust-like moist frass in leaf whorls."
        ],
        "biological": "Apply sand-lime mixture (9:1) or wood ash into whorls. Spray Nomuraea rileyi or Metarhizium anisopliae @ 5g/liter. Release Telenomus remus parasitoids.",
        "chemical": "Whorl application of Spinetoram 11.7% SC @ 0.5 ml/liter (100 ml/acre) or Chlorantraniliprole 18.5% SC @ 0.4 ml/liter directed into the central leaf whorls. PHI: 21 days."
    },
    "whitefly": {
        "common_name": "Cotton Whitefly",
        "scientific_name": "Bemisia tabaci",
        "target_crops": ["Cotton", "Soybean"],
        "etl": "6-8 adults or 20 nymphs per leaf on upper and middle canopy",
        "monitoring": [
            "Install yellow sticky traps coated with castor oil or grease @ 15-20 traps/acre.",
            "Scout lower leaf surfaces early in the morning before adult flight activity accelerates.",
            "Look for glistening sooty mold development resulting from honey-dew excretion."
        ],
        "biological": "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 1500 ppm @ 5 ml/liter. Conserve Chrysoperla carnea.",
        "chemical": "Spray Diafenthiuron 50% WP @ 1.2 g/liter or Pyriproxyfen 10% EC @ 2 ml/liter for nymphs, Flonicamid 50% WG @ 0.3 g/liter for adults. PHI: 20 days."
    },
    "stem_borer": {
        "common_name": "Yellow Stem Borer",
        "scientific_name": "Scirpophaga incertulas",
        "target_crops": ["Rice"],
        "etl": "2 egg masses/sq. meter OR 1 moth/sq. meter OR 5% dead hearts (vegetative) OR 2% white ears (heading stage)",
        "monitoring": [
            "Install light traps and pheromone traps (Scirpolure) @ 8 traps/acre.",
            "Scout for yellowing central tillers ('dead hearts') in vegetative rice and empty chaffy erect white panicles ('white ears').",
            "Clip seedling leaf tips before transplanting to eliminate hidden egg masses."
        ],
        "biological": "Release Trichogramma japonicum @ 40,000/acre at weekly intervals from 30 DAT (Days After Transplanting).",
        "chemical": "Apply Chlorantraniliprole 0.4% GR @ 4 kg/acre or Cartap Hydrochloride 4% G @ 7.5 kg/acre in standing water (2-3 cm). PHI: 21 days."
    },
    "aphids": {
        "common_name": "Cotton Aphid / Bean Aphid",
        "scientific_name": "Aphis gossypii",
        "target_crops": ["Cotton", "Soybean"],
        "etl": "10% infested plants with colonies or cupped leaves",
        "monitoring": [
            "Examine tender shoot terminals and undersides of expanding leaves.",
            "Check for curling leaves, ant activity, and black sooty mold growth."
        ],
        "biological": "Conserve Coccinellid predatory beetles (ladybugs) and syrphid fly larvae. Spray Verticillium lecanii @ 5g/liter.",
        "chemical": "Spray Acetamiprid 20% SP @ 0.2 g/liter (40g/acre) or Thiamethoxam 25% WG @ 0.2 g/liter (40g/acre). PHI: 15 days."
    }
}

def get_crop_recommendation(crop: str, condition_key: str) -> Dict[str, Any]:
    crop_lower = crop.lower()
    crop_data = RECOMMENDATION_DATABASE.get(crop_lower)
    if not crop_data:
        # Fallback to cotton or first crop
        crop_data = RECOMMENDATION_DATABASE["cotton"]
    
    # Try exact match or fuzzy match
    rec = crop_data.get(condition_key)
    if not rec:
        for k, v in crop_data.items():
            if k in condition_key or condition_key in k:
                rec = v
                break
    if not rec:
        rec = crop_data["healthy"]
    return rec

def get_pest_guidance(pest_key: str) -> Dict[str, Any]:
    pest_lower = pest_key.lower().replace(" ", "_")
    for key, data in PEST_DATABASE.items():
        if key in pest_lower or pest_lower in key:
            return data
    return PEST_DATABASE["fall_armyworm"]

