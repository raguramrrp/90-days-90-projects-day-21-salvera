# SALVERA — Technology Salary & Career Intelligence Platform

> **Understand your market value. Make smarter career moves.**  
> *Day 21 of the 90 Days – 90 Projects Challenge (AI & Data Science Portfolio)*

[![Python 3.12](https://img.shields.io/badge/Python-3.12-286B59.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-286B59.svg)](LICENSE)
[![Tests: 24 Passed](https://img.shields.io/badge/Tests-24%20Passed-397A5D.svg)](tests/)
[![Scope: India Only](https://img.shields.io/badge/Scope-India%20Only-orange.svg)](frontend/src/pages/FindJobsPage.tsx)

---

## 1. Problem Statement & Motivation

Traditional salary platforms primarily present flat average numbers. However, technology compensation in India and global markets is multi-dimensional:
1. **Misleading Averages:** Flat averages conceal wide variations between 25th, 50th, and 75th percentiles.
2. **False Causality:** Generic websites often claim that learning a skill directly inflates salary, ignoring role seniority, company scale, and location differentials.
3. **CTC Confusion:** Stated Cost-to-Company (CTC) figures bundle one-time joining bonuses, deferred equity, and non-cash perks, leaving job seekers with unexpectedly low monthly take-home pay.
4. **Lack of Actionable Roadmaps:** Knowing a target role's salary does not inform candidates of the exact technical gaps required to achieve that compensation tier.

**SALVERA** provides an editorial-grade career and compensation intelligence platform. It distinguishes between *observed survey records*, *statistical associations*, *machine learning predictions*, and *user-entered parameters* to help students, job seekers, and technology professionals make informed career decisions.

---

## 2. Objectives & Intended Users

- **College Students & Fresh Graduates:** Benchmark realistic entry-level packages, explore skill requirements for target roles (e.g., Data Analyst vs. Data Scientist), and build personalized learning roadmaps.
- **Technology Professionals (1–7 Years Experience):** Evaluate market worth, compare multiple job offers side-by-side, and analyze compensation lift associated with complementary skills.
- **Career Switchers:** Identify transferable skills and prioritize high-frequency technical gaps to transition into AI/ML or Cloud engineering.
- **Recruiters & Compensation Analysts:** Benchmark realistic salary distributions across Indian tech hubs (Bengaluru, Chennai, Hyderabad, Pune, Mumbai, Delhi NCR, Coimbatore).

---

## 3. Key Features

1. **Find Jobs — India-First Discovery (`/find-jobs`):**
   - **Strictly India Only:** Tailored for Indian tech hubs (Bengaluru, Chennai, Hyderabad, Pune, Mumbai, Delhi NCR, Coimbatore, Tirunelveli, Madurai, Kochi).
   - **Multi-Factor Filter Bar:** Search by role, skills, Indian cities, experience tiers (Fresher 0–1y, Junior 1–3y, Mid 3–6y, Senior 6+y), work modes (On-site, Hybrid, Remote in India), and salary disclosure.
   - **Inspection Workspace:** Detailed role responsibilities, requirements, and direct external application links.
   - **Market Benchmark Integration:** Compares advertised compensation directly against SALVERA's 5,292 benchmark records (Median, P25, P75).
   - **Skill Alignment Matrix:** Automatic comparison highlighting matching skills, missing required competencies, and preferred skills.

2. **Personalized Recommendations (`/recommended-jobs`):**
   - Explainable multi-factor scoring: Skill Overlap (40%), Target Role Fit (25%), Experience Bracket Fit (15%), Location Preference (10%), Work Mode Fit (10%).
   - Human-readable rationales explaining exactly why an opening matches the candidate's profile.

3. **My Activity & Application Kanban (`/my-activity`):**
   - **Saved Jobs:** Quick bookmarking and management of interesting openings.
   - **Application Kanban Tracker:** Visual stages (`Applied` → `Interviewing` → `Offered` → `Archived`) with status updates and salary offer logging.

4. **Career Profile Preferences (`/career-profile`):**
   - Configurable preferences for target roles, primary/secondary skills, experience level, preferred Indian cities, and minimum target salary.

5. **Job Alerts & Feeds (`/job-alerts`):**
   - Automated notification rules for new openings by role keywords, city, and minimum salary thresholds.

6. **Market Overview (`/overview`):**
   - High-level metrics calculated from 5,292 database records: median salary (₹24.0 LPA), 21 roles, 85 skills, 7 tech hubs.
   - Salary distribution histogram and experience compensation curve (+42% mid-level inflection).
   - Most frequently reported technical skills and factual career insights.
2. **Salary Explorer (`/salary-explorer`):**
   - Multi-factor filtering by Role, City, Experience range, Industry, Employment Mode, and free-text/skill search.
   - Real-time percentiles (P25, Median, P75, Mean, Min, Max) with automatic sample reliability warnings ($N < 25$).
   - Interactive records table with active filter pills, one-click query relaxation, sorting, pagination, and CSV export.
3. **Skill Intelligence (`/skills`):**
   - Searchable skills leaderboard across 8 categories.
   - **Multi-Profile Comparison Studio:** Compare `[Python]` vs. `[Python, SQL, AWS]` to inspect record volume, median salary, and IQR spread.
   - Frequent itemset bundles with empirical salary lift percentages.
4. **Role Explorer (`/roles`):**
   - Standardized taxonomies across Data & Analytics, Software Dev, AI & ML, QA & Security, Infrastructure.
   - Side-by-side comparison of up to 4 roles comparing 25th–75th percentiles, key skills, and experience spreads.
5. **Location Intelligence (`/locations`):**
   - Indian tech hub comparisons (Bengaluru, Hyderabad, Pune, Chennai, Mumbai, Delhi NCR, Coimbatore).
   - Benchmark Cost-of-Living (COL) indices and cross-city compensation differentials.
6. **Offer Comparison Studio (`/offer-studio`):**
   - Deconstructs Stated CTC, Recurring Gross Annual, Monthly Gross Equivalent, Estimated Monthly Take-Home, and **Net Monthly Disposable Surplus** (after rent and commute).
   - Side-by-side comparison table, visual stacked bar chart, and ReportLab PDF export.
7. **Machine Learning Salary Estimator (`/salary-estimator`):**
   - Scikit-learn Gradient Boosting Regressor ($R^2 = 85.5\%$, $\text{MAE} = ₹3.19\text{L}$).
   - Generates predicted annual compensation, monthly equivalent, and a **90% statistical prediction interval**.
   - Feature importance weighting and cross-validation benchmark table.
8. **Career Planner & Gap Analysis (`/career-planner`):**
   - Audits current skills against empirical target role frequencies.
   - Categorizes into *Current Strengths*, *Core Gaps*, *Recommended Additions*, and *Advanced Specializations*.
   - Interactive milestone checklist (`Planned`, `In Progress`, `Completed`) with custom skill addition and PDF export.
9. **Market Watch (`/market-watch`):**
   - Personal tracking board for roles, skills, and cities against baseline snapshots.
   - Verified platform activity feed for dataset ingestion and model versioning events.
10. **Data & Insights Centre (`/data-insights`):**
    - Data hygiene audit: composite quality score (97.5/100), missing-field %, duplicate counts, and IQR outlier reviews.
    - Dataset provenance table and CSV dataset ingestion workflow.

---

## 4. Visual Identity & Editorial UI/UX Design

SALVERA adopts an editorial financial research aesthetic:
- **No Left Sidebar:** Full-width workspaces with an intuitive horizontal top navigation bar.
- **Restrained Palette:** `#F6F7F5` background, `#286B59` deep forest green, `#A5B8AC` sage slate, `#E3E7E3` subtle borders.
- **Responsive Layout:** Adaptive desktop and mobile interfaces with touch-friendly controls.

---

## 5. Technology Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, Alembic, Pydantic v2, Uvicorn.
- **Machine Learning & Analytics:** Scikit-learn (GradientBoostingRegressor, RandomForestRegressor, Ridge), Pandas, NumPy, Joblib.
- **Reporting & Export:** ReportLab (PDF generation), Python CSV engine.
- **Database:** SQLite (default zero-friction offline execution) / PostgreSQL (via `DATABASE_URL`).
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Testing & Quality Assurance:** Pytest, Pytest-Cov, Starlette TestClient, Flake8/Black patterns.

---

## 6. Directory Structure

```
90-days-90-projects-day-21-salvera/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (overview, salaries, skills, roles, offers, etc.)
│   │   ├── core/            # Configuration & settings
│   │   ├── database/        # SQLAlchemy session & relational models
│   │   ├── ml/              # Scikit-learn training pipeline & inference predictor
│   │   ├── schemas/         # Pydantic v2 request/response schemas
│   │   ├── services/        # Business logic (salary, skills, roles, offers, PDF, etc.)
│   │   └── main.py          # FastAPI application entrypoint
│   └── scripts/
│       ├── generate_demo_data.py  # 2,250 synthetic benchmark records generator
│       ├── seed_db.py             # Database seeding script
│       └── train_model.py         # ML model training script
├── data/
│   └── demo/                # Synthetic benchmark CSVs, metadata, and README
├── docs/                    # Architecture, User Guide, Development Notes, Testing, Troubleshooting
├── frontend/                # React 19 + TypeScript + Vite + Tailwind CSS web application
├── models/                  # Saved ML model bundle (salary_model.joblib) & metrics
├── tests/                   # Automated Pytest suite (16 test cases)
├── setup.bat                # Automated Windows setup script
├── run.bat                  # One-click Windows application launcher
├── test.bat                 # Automated test runner script
├── requirements.txt         # Python dependencies manifest
├── QUICKSTART.md            # Fast setup instructions
├── DEMO_SCRIPT.md           # 90-second portfolio presentation script
└── README.md                # Project documentation
```

---

## 7. Step-by-Step Windows Installation

### Prerequisites
- Windows 10/11 (64-bit)
- Python 3.12 (64-bit) installed
- Node.js (v18+) and npm installed

### Quick Start
```cmd
# 1. Clone repository
git clone https://github.com/raguramrrp/90-days-90-projects-day-21-salvera.git
cd 90-days-90-projects-day-21-salvera

# 2. Run automated setup (creates .venv, seeds DB, trains ML model, builds frontend)
setup.bat

# 3. Launch the platform
run.bat
```

### URLs
- **Frontend Web UI:** [http://localhost:5173](http://localhost:5173)
- **FastAPI OpenAPI Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 8. Automated Testing & Verification

Execute the complete test suite:
```cmd
test.bat
```

### Actual Test Results
```
tests/test_services.py::test_normalization_direct_inr PASSED             [  6%]
tests/test_services.py::test_normalization_monthly_inr PASSED            [ 12%]
tests/test_services.py::test_normalization_usd PASSED                    [ 18%]
tests/test_services.py::test_inr_formatting PASSED                       [ 25%]
tests/test_services.py::test_salary_analytics_summary PASSED             [ 31%]
tests/test_services.py::test_salary_distribution_bins PASSED             [ 37%]
tests/test_services.py::test_salary_by_experience PASSED                 [ 43%]
tests/test_services.py::test_skill_rankings PASSED                       [ 50%]
tests/test_services.py::test_skill_comparison PASSED                     [ 56%]
tests/test_services.py::test_role_service PASSED                         [ 62%]
tests/test_services.py::test_location_service PASSED                     [ 68%]
tests/test_services.py::test_offer_studio_financial_decomposition PASSED [ 75%]
tests/test_services.py::test_career_planner_gap_analysis PASSED          [ 81%]
tests/test_services.py::test_ml_salary_predictor PASSED                  [ 87%]
tests/test_services.py::test_dataset_quality_metrics PASSED              [ 93%]
tests/test_services.py::test_pdf_generators PASSED                       [100%]

======================= 16 passed in 5.65s =======================
[PASS] ML model artifacts verified.
[PASS] Frontend production build verified.
```

---

## 9. Machine Learning Model Evaluation Summary

| Algorithm | R² Score | MAE (INR) | RMSE (INR) | Median Abs Error | Status |
|---|---|---|---|---|---|
| **Gradient Boosting Regressor** | **91.26%** | **₹2,81,543** | **₹4,18,866** | **₹1,90,985** | **Selected Best Model** |
| Linear Regression | 87.77% | ₹3,59,650 | ₹4,95,648 | ₹2,83,862 | Evaluated Benchmark |
| Random Forest Regressor | 86.12% | ₹3,87,573 | ₹5,28,027 | ₹3,05,677 | Evaluated Benchmark |

---

## 10. Data Provenance & Synthetic Disclaimer

- **Label:** `DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY.`
- **License:** Creative Commons CC-BY 4.0
- **Scope:** 5,292 records across 21 technology roles and 7 Indian tech hubs with guaranteed stratified cross-filter density.
- **Attribution:** Generated through log-normal multi-factor calibration for reproducible offline evaluation without paid external APIs.

---

## 11. Learning Outcomes & Resume Keywords

**Technical Keywords:** Full-Stack Architecture, FastAPI, Scikit-learn, Regression Analysis, ColumnTransformer, Multi-Hot Encoding, Prediction Intervals, Data Provenance, Data Hygiene Auditing, Financial Decomposition, ReportLab PDF Generation, React 19, TypeScript, Recharts, Tailwind CSS, Windows Batch Scripting.

---

## 12. License

This project is licensed under the [MIT License](LICENSE).
