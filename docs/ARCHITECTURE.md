# SALVERA — System Architecture & Technical Design

## 1. High-Level Architecture Overview

SALVERA adopts a decoupled, multi-tier full-stack architecture tailored for high performance, local offline execution, and statistical rigor:

```mermaid
flowchart TD
    subgraph Frontend["Frontend Client (React 19 + TypeScript + Vite + Tailwind CSS)"]
        UI["Top Horizontal Navigation (No Left Sidebar)"]
        Pages["11 Analytical Workspaces (Overview, Explorer, Skills, Roles, Offers, etc.)"]
        Charts["Recharts Visualizations (Histogram, Scatter, Area, Stacked Bar)"]
        API_Client["Typed API Client Service"]
        UI --> Pages
        Pages --> Charts
        Pages --> API_Client
    end

    subgraph Backend["Backend API Service (FastAPI + Python 3.12)"]
        Router["FastAPI REST Routers (/api/v1/*)"]
        Services["Core Service Layer (Salary, Skill, Role, Location, Offer, Career, Quality)"]
        ML_Engine["Scikit-Learn ML Regressor (Gradient Boosting + ColumnTransformer)"]
        Normalizer["Salary Normalization & Formatting Service"]
        PDF_Engine["ReportLab Document Export Engine"]
        Router --> Services
        Services --> ML_Engine
        Services --> Normalizer
        Services --> PDF_Engine
    end

    subgraph Data["Persistence & Data Layer"]
        ORM["SQLAlchemy ORM + Session Management"]
        DB[("PostgreSQL / SQLite Storage")]
        Models_Disk[("Trained Model Artifacts (models/salary_model.joblib)")]
        Raw_CSV[("Benchmark Corpus (data/demo/*.csv)")]
        ORM --> DB
        ML_Engine --> Models_Disk
        Services --> ORM
    end

    API_Client <-->|JSON / REST HTTP| Router
```

---

## 2. Machine Learning Regression Pipeline

```mermaid
flowchart LR
    A["Raw Salary Records (2,250 rows)"] --> B["Train/Test Split (80/20 held-out)"]
    
    subgraph Pipeline["Scikit-Learn Pipeline (No Data Leakage)"]
        B --> C["Categorical Features (Role, City, Industry, Mode)"]
        B --> D["Numerical Features (Experience Years)"]
        B --> E["Skills Multi-hot Encoder (Min Freq >= 3)"]
        
        C --> F["OneHotEncoder (handle_unknown='ignore')"]
        D --> G["StandardScaler"]
        E --> H["Multi-Hot Binary Matrix"]
        
        F & G & H --> I["Feature Stacking (np.hstack)"]
        I --> J["Gradient Boosting Regressor (120 Trees)"]
    end

    J --> K["Residual Standard Deviation (sigma = 150k)"]
    J --> L["Saved Artifact: models/salary_model.joblib"]
    K --> M["Inference: Predicted Salary ± 1.645 * sigma (90% Interval)"]
```

---

## 3. Relational Database Schema (SQLAlchemy / PostgreSQL)

```mermaid
erDiagram
    DATASETS ||--o{ SALARY_RECORDS : contains
    JOB_ROLES ||--o{ SALARY_RECORDS : classifies
    LOCATIONS ||--o{ SALARY_RECORDS : locates
    JOB_ROLES ||--o{ ROLE_SKILLS : requires
    SKILLS ||--o{ ROLE_SKILLS : categorizes
    OFFER_COMPARISONS ||--o{ JOB_OFFERS : groups
    USER_PROFILES ||--o{ CAREER_PLANS : plans
    JOB_ROLES ||--o{ CAREER_PLANS : targets
    CAREER_PLANS ||--o{ CAREER_PLAN_SKILLS : tracks
    MODEL_VERSIONS ||--o{ SALARY_PREDICTIONS : generates

    DATASETS {
        int id PK
        string dataset_name
        string source_name
        int record_count
        boolean is_synthetic
        float quality_score
    }

    JOB_ROLES {
        int id PK
        string canonical_title
        string category
        text description
    }

    SKILLS {
        int id PK
        string skill_name
        string normalized_name
        string category
    }

    LOCATIONS {
        int id PK
        string city
        string state
        string tier
        float col_index
    }

    SALARY_RECORDS {
        int id PK
        int dataset_id FK
        int role_id FK
        int location_id FK
        float experience_years
        string industry
        json skills_list
        float original_salary
        float normalized_annual_salary
        boolean is_synthetic
    }

    JOB_OFFERS {
        int id PK
        int comparison_id FK
        string company_name
        float fixed_salary
        float variable_salary
        float joining_bonus
        float annual_benefits
        float monthly_deductions
        float monthly_rent
        float monthly_commute
    }
```

---

## 4. Key Architectural Trade-offs & Decisions

1. **Dual Database Engine (SQLite default with native PostgreSQL support):**
   - *Decision:* Configured SQLAlchemy to default to local SQLite (`data/salvera.db`) with zero manual server setup while fully supporting PostgreSQL via `DATABASE_URL`.
   - *Rationale:* Ensures Windows developers, interviewers, and evaluators can clone and run `run.bat` instantly without spinning up PostgreSQL services.

2. **ColumnTransformer + Multi-Hot Encoding for Skills:**
   - *Decision:* Replaced naive one-hot encoding with a dedicated `MultiHotSkillEncoder` that parses delimited skill strings, filters rare tokens, and fits vocabulary exclusively on training records.
   - *Rationale:* Eliminates data leakage and avoids sparse dimension explosions.

3. **Residual Prediction Intervals over Hardcoded Percentages:**
   - *Decision:* Computed empirical residual standard deviations from test set errors to construct $z = 1.645$ (90% confidence) uncertainty bounds.
   - *Rationale:* Honors the prompt requirement to provide statistically defensible intervals rather than inventing arbitrary confidence percentages.
