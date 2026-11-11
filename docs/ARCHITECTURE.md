# CropGuard AI — Architectural Specification
## SIH26131 | Early Detection & Agricultural Intelligence Platform
### Government of Maharashtra | Department of Agriculture

---

## 1. System Overview

CropGuard AI is an enterprise agricultural health monitoring and epidemiological surveillance platform designed for the State of Maharashtra. It provides early detection of foliar crop diseases, bounding-box spatial insect pest identification, microclimate disease-risk forecasting, certified KVK agronomist verification workflows, and statewide geographic surveillance maps.

```
                    +----------------------------------------+
                    |       Frontend (React + Vite + TS)     |
                    |  Tailwind CSS • Recharts • Leaflet Map |
                    +-------------------+--------------------+
                                        | (REST JSON / JWT)
                                        v
                    +----------------------------------------+
                    |      FastAPI Application Gateway       |
                    +-------------------+--------------------+
                                        |
     +-------------------+--------------+--------------+-------------------+
     |                   |                             |                   |
     v                   v                             v                   v
+------------+  +-------------------+        +-------------------+  +------------+
| Auth & RBAC|  |   Pathology AI    |        | Spatial Pest AI   |  | Microclimate
| JWT Token  |  |  Classification   |        | Object Detection  |  | Risk Model
| Farmer/    |  |  (MobileNetV2     |        | (YOLO Cluster/    |  | (Random    |
| Expert/Gov |  |   Pathology)      |        |  ETL Calculator)  |  |  Forest)   |
+------------+  +-------------------+        +-------------------+  +------------+
     |                   |                             |                   |
     +-------------------+--------------+--------------+-------------------+
                                        |
                                        v
                    +----------------------------------------+
                    |        PostgreSQL / SQLite Engine      |
                    |  Users, Profiles, Reports, Advisories  |
                    +----------------------------------------+
```

---

## 2. Role-Based Access Control (RBAC)

1. **Farmer Role (`farmer`)**:
   - Authentication via mobile number.
   - Farm profile with district, taluka, village, land area in acres, and primary crops.
   - Upload leaf photographs or capture via camera.
   - View AI pathology diagnosis, confidence scores, foliar damage percentages, and severity.
   - Receive verified ICAR / MPKV management instructions (cultural, biological, chemical with pre-harvest intervals).
   - View real-time synoptic weather (temperature, relative humidity, precipitation, wind speed) and 5-day outlook.
   - Review past diagnostic history and submit follow-up recovery observations.
   - Multilingual interface supporting **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)**.

2. **Agricultural Expert Role (`expert`)**:
   - Access to the KVK Expert Verification Queue.
   - High-resolution specimen photo inspection.
   - Review AI predictions and severity metrics.
   - Verify, correct, or reject initial diagnoses.
   - Formulate expert clinical observations and custom spray prescriptions.
   - Monitor field recovery progress from farmer follow-up logs.

3. **Government Administrator Role (`admin`)**:
   - Statewide Agricultural Surveillance Command Center.
   - Aggregated state metrics: registered farmers, total reports, confirmed cases, active pest outbreaks.
   - Interactive Maharashtra Leaflet map visualizing 36 districts, verified hotspots, and risk levels.
   - Recharts analytics: crop distribution breakdown and weekly epidemiological incidence trends.
   - District-level vulnerability index and CSV data export.

---

## 3. Database Schema

- `users`: Core identity table with phone, name, email, role, and hashed credentials.
- `farmer_profiles`: Geolocation (district, taluka, village, coordinates), land area, primary crop, and preferred language.
- `crops`: Supported crop varieties (Cotton, Soybean, Rice, Maize), scientific taxonomy, and agro-climatic requirements.
- `crop_reports`: Diagnostic records with image references, condition, healthy/affected flag, confidence, severity, symptoms, and standard recommendations.
- `expert_verifications`: Certified agronomist endorsements, corrected diagnoses, clinical notes, and prescriptions.
- `follow_up_reports`: Field recovery monitoring submissions with farmer notes and recovery status.
- `weather_observations`: Synoptic weather cache for Maharashtra districts.
- `risk_predictions`: Environmental risk predictions, outbreak probability scores, and meteorological drivers.
- `advisories`: Standard operating agricultural guidance traceable to ICAR, MPKV Rahuri, PDKV Akola, and VNMKV Parbhani.

---

## 4. Machine Learning & Analytical Pipelines

1. **Foliar Disease Classification**:
   - Input: 224x224 RGB crop leaf photograph.
   - Preprocessing: Normalization and spectral feature extraction (RGB & HSV).
   - Pathology Analysis: Computes foliar damage percentage, necrosis, and chlorosis ratio.
   - Output: Crop variety, predicted condition, confidence score (0-100%), and severity assessment (Healthy, Mild, Moderate, Severe).
   - Safety Fallback: Flags low-confidence or non-leaf images and escalates to human expert review.

2. **Spatial Pest Object Detection**:
   - Input: 416x416 pest trap or foliar photograph.
   - Architecture: Segmented spatial bounding boxes `[ymin, xmin, ymax, xmax]`.
   - Organisms: Pink Bollworm (*Pectinophora gossypiella*), Fall Armyworm (*Spodoptera frugiperda*), Whitefly (*Bemisia tabaci*), Stem Borer (*Scirpophaga incertulas*), and Aphids (*Aphis gossypii*).
   - Economic Threshold Level (ETL) Evaluator: Differentiates below ETL (manageable), at ETL, and above ETL (critical outbreak).

3. **Microclimate Epidemiological Risk Forecaster**:
   - Model: Scikit-learn Random Forest Classifier.
   - Features: Crop variety, phenological growth stage, ambient temperature, relative humidity, recent rainfall, and prior nearby confirmed cases.
   - Output: Risk category (Low, Moderate, High, Critical), probability percentage, and meteorological driving factors.

