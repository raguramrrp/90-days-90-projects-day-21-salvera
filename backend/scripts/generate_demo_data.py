import os
import json
import csv
import random
from pathlib import Path

# Set seed for reproducible, high-fidelity synthetic benchmark dataset
random.seed(42)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEMO_DIR = BASE_DIR / "data" / "demo"
DEMO_DIR.mkdir(parents=True, exist_ok=True)

# 1. Standardized Locations
LOCATIONS = [
    {"city": "Bengaluru", "state": "Karnataka", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 115.0, "sal_mult": 1.16},
    {"city": "Hyderabad", "state": "Telangana", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 105.0, "sal_mult": 1.06},
    {"city": "Pune", "state": "Maharashtra", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 102.0, "sal_mult": 1.03},
    {"city": "Chennai", "state": "Tamil Nadu", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 100.0, "sal_mult": 1.00},
    {"city": "Mumbai", "state": "Maharashtra", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 125.0, "sal_mult": 1.12},
    {"city": "Delhi NCR", "state": "Delhi / Haryana", "country": "India", "country_code": "IND", "tier": "Tier 1", "col_index": 110.0, "sal_mult": 1.08},
    {"city": "Coimbatore", "state": "Tamil Nadu", "country": "India", "country_code": "IND", "tier": "Tier 2", "col_index": 82.0, "sal_mult": 0.85},
]

# 2. Standardized Roles with base salary bounds (in LPA) & typical skills
ROLES = [
    {
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "desc": "Analyzes raw data to discover operational trends, business insights, and KPI patterns.",
        "base_min_lpa": 4.5, "base_max_lpa": 14.0,
        "skills": ["SQL", "Excel", "Python", "Power BI", "Tableau", "Statistics", "Data Cleaning"]
    },
    {
        "title": "Business Analyst",
        "category": "Data & Analytics",
        "desc": "Bridges technology and business strategy through requirement modeling and data reporting.",
        "base_min_lpa": 5.0, "base_max_lpa": 15.5,
        "skills": ["Excel", "SQL", "Tableau", "Power BI", "Agile", "Jira", "Stakeholder Management"]
    },
    {
        "title": "Data Scientist",
        "category": "Data & Analytics",
        "desc": "Builds statistical, algorithmic, and predictive models from structured and unstructured data.",
        "base_min_lpa": 8.0, "base_max_lpa": 27.0,
        "skills": ["Python", "SQL", "Machine Learning", "Scikit-learn", "Statistics", "Pandas", "Deep Learning"]
    },
    {
        "title": "Business Intelligence Analyst",
        "category": "Data & Analytics",
        "desc": "Designs enterprise semantic models, dimensional marts, and executive dashboards.",
        "base_min_lpa": 5.8, "base_max_lpa": 17.5,
        "skills": ["Power BI", "SQL", "DAX", "Data Warehousing", "Tableau", "ETL", "Excel"]
    },
    {
        "title": "Data Engineer",
        "category": "Data & Analytics",
        "desc": "Constructs reliable data pipelines, distributed storage, and real-time streaming infrastructure.",
        "base_min_lpa": 7.5, "base_max_lpa": 26.0,
        "skills": ["Python", "SQL", "Spark", "Airflow", "AWS", "Docker", "Kafka", "Data Warehousing"]
    },
    {
        "title": "Python Developer",
        "category": "Software Development",
        "desc": "Develops backend services, automated scripts, and RESTful APIs using Python frameworks.",
        "base_min_lpa": 4.8, "base_max_lpa": 18.0,
        "skills": ["Python", "Django", "FastAPI", "SQL", "Git", "REST APIs", "Docker", "PostgreSQL"]
    },
    {
        "title": "Java Developer",
        "category": "Software Development",
        "desc": "Builds enterprise backend architectures, microservices, and transaction-safe systems.",
        "base_min_lpa": 5.5, "base_max_lpa": 20.0,
        "skills": ["Java", "Spring Boot", "Microservices", "SQL", "Git", "Docker", "Kubernetes"]
    },
    {
        "title": "Frontend Developer",
        "category": "Software Development",
        "desc": "Creates responsive, accessible user interfaces and web applications using modern web technologies.",
        "base_min_lpa": 4.8, "base_max_lpa": 18.0,
        "skills": ["JavaScript", "TypeScript", "React", "HTML/CSS", "Tailwind CSS", "Next.js", "Git"]
    },
    {
        "title": "Backend Developer",
        "category": "Software Development",
        "desc": "Engineers scalable server-side systems, high-concurrency database querying, and API contracts.",
        "base_min_lpa": 5.8, "base_max_lpa": 22.0,
        "skills": ["Node.js", "Python", "PostgreSQL", "REST APIs", "Redis", "Docker", "System Design"]
    },
    {
        "title": "Full Stack Developer",
        "category": "Software Development",
        "desc": "Delivers end-to-end applications covering modern frontend frameworks and backend databases.",
        "base_min_lpa": 6.0, "base_max_lpa": 24.0,
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Git", "AWS", "REST APIs"]
    },
    {
        "title": "Software Engineer",
        "category": "Software Development",
        "desc": "Solves core computer science engineering challenges across system architecture and algorithms.",
        "base_min_lpa": 5.5, "base_max_lpa": 23.0,
        "skills": ["Java", "Python", "Data Structures", "Algorithms", "Git", "System Design", "SQL"]
    },
    {
        "title": "Machine Learning Engineer",
        "category": "AI & ML",
        "desc": "Deploys machine learning models into high-throughput production pipelines with MLOps standards.",
        "base_min_lpa": 9.0, "base_max_lpa": 32.0,
        "skills": ["Python", "Scikit-learn", "PyTorch", "TensorFlow", "MLOps", "Docker", "AWS", "Statistics"]
    },
    {
        "title": "AI Engineer",
        "category": "AI & ML",
        "desc": "Integrates modern generative AI architectures, foundational LLMs, and multi-modal workflows.",
        "base_min_lpa": 10.0, "base_max_lpa": 35.0,
        "skills": ["Python", "PyTorch", "Transformers", "LLMs", "LangChain", "Vector Databases", "FastAPI"]
    },
    {
        "title": "Deep Learning Engineer",
        "category": "AI & ML",
        "desc": "Designs neural networks for complex computer vision, speech, and natural language modeling.",
        "base_min_lpa": 10.5, "base_max_lpa": 34.0,
        "skills": ["PyTorch", "TensorFlow", "Computer Vision", "NLP", "CUDA", "Python", "Linux"]
    },
    {
        "title": "Computer Vision Engineer",
        "category": "AI & ML",
        "desc": "Builds spatial recognition, edge inference, and camera sensor video pipelines.",
        "base_min_lpa": 9.0, "base_max_lpa": 29.0,
        "skills": ["OpenCV", "PyTorch", "Computer Vision", "Python", "C++", "Image Processing"]
    },
    {
        "title": "QA Engineer",
        "category": "Quality & Security",
        "desc": "Verifies software quality through regression automation, unit validation, and test harness execution.",
        "base_min_lpa": 3.8, "base_max_lpa": 13.5,
        "skills": ["Manual Testing", "Selenium", "Python", "SQL", "API Testing", "Pytest", "Jira"]
    },
    {
        "title": "Software Test Engineer",
        "category": "Quality & Security",
        "desc": "Constructs test frameworks and end-to-end integration test suites across CI/CD pipelines.",
        "base_min_lpa": 4.2, "base_max_lpa": 14.5,
        "skills": ["Automation Testing", "Selenium", "Java", "Cypress", "Postman", "CI/CD", "Git"]
    },
    {
        "title": "Cybersecurity Analyst",
        "category": "Quality & Security",
        "desc": "Defends organizational infrastructure against zero-day threats, intrusions, and protocol breaches.",
        "base_min_lpa": 6.0, "base_max_lpa": 21.0,
        "skills": ["Network Security", "SIEM", "Vulnerability Assessment", "Linux", "Python", "Wireshark"]
    },
    {
        "title": "Cloud Engineer",
        "category": "Infrastructure",
        "desc": "Architects resilient, secure public cloud infrastructure and identity boundaries.",
        "base_min_lpa": 7.0, "base_max_lpa": 24.0,
        "skills": ["AWS", "Azure", "Terraform", "Linux", "Networking", "Docker", "Python"]
    },
    {
        "title": "DevOps Engineer",
        "category": "Infrastructure",
        "desc": "Automates deployment pipelines, container orchestration, and continuous delivery systems.",
        "base_min_lpa": 8.0, "base_max_lpa": 26.5,
        "skills": ["Docker", "Kubernetes", "Jenkins", "Terraform", "CI/CD", "AWS", "Linux", "Bash"]
    },
    {
        "title": "Site Reliability Engineer",
        "category": "Infrastructure",
        "desc": "Ensures uptime, fault tolerance, distributed observability, and latency SLA adherence.",
        "base_min_lpa": 9.2, "base_max_lpa": 30.0,
        "skills": ["Kubernetes", "Linux", "Prometheus", "Grafana", "Python", "Go", "System Design"]
    }
]

INDUSTRIES = [
    "Information Technology",
    "Fintech",
    "E-commerce",
    "Healthcare Tech",
    "Enterprise Software",
    "EdTech",
    "Consulting"
]

EMPLOYMENT_TYPES = ["Full-time", "Full-time", "Full-time", "Full-time", "Contract", "Remote"]

def generate():
    print("Generating SALVERA benchmark demonstration dataset...")
    
    # 1. Collect all distinct skills
    all_skills_set = set()
    for r in ROLES:
        for s in r["skills"]:
            all_skills_set.add(s)
            
    # Add extra cross-discipline skills
    extra_skills = [
        ("MongoDB", "Database & Query"),
        ("PostgreSQL", "Database & Query"),
        ("Redis", "Database & Query"),
        ("Snowflake", "Data Warehousing"),
        ("GCP", "Cloud & DevOps"),
        ("GraphQL", "Frameworks & Libraries"),
        ("Angular", "Frameworks & Libraries"),
        ("Rust", "Programming"),
        ("C++", "Programming"),
        ("Go", "Programming"),
        ("R", "Programming"),
        ("Prompt Engineering", "Machine Learning"),
        ("Fine-Tuning", "Machine Learning"),
    ]
    
    skill_categories = {
        "Python": "Programming", "Java": "Programming", "JavaScript": "Programming",
        "TypeScript": "Programming", "C++": "Programming", "Go": "Programming",
        "SQL": "Database & Query", "PostgreSQL": "Database & Query", "MongoDB": "Database & Query", "Redis": "Database & Query",
        "Excel": "BI & Visualization", "Power BI": "BI & Visualization", "Tableau": "BI & Visualization", "DAX": "BI & Visualization",
        "AWS": "Cloud & DevOps", "Azure": "Cloud & DevOps", "GCP": "Cloud & DevOps", "Docker": "Cloud & DevOps", "Kubernetes": "Cloud & DevOps", "Terraform": "Cloud & DevOps", "CI/CD": "Cloud & DevOps", "Linux": "Cloud & DevOps", "Bash": "Cloud & DevOps",
        "Machine Learning": "Machine Learning", "Deep Learning": "Machine Learning", "Scikit-learn": "Machine Learning", "PyTorch": "Machine Learning", "TensorFlow": "Machine Learning", "MLOps": "Machine Learning", "Statistics": "Machine Learning", "Computer Vision": "Machine Learning", "NLP": "Machine Learning", "LLMs": "Machine Learning", "Transformers": "Machine Learning", "LangChain": "Machine Learning", "Vector Databases": "Machine Learning",
        "React": "Frameworks & Libraries", "Next.js": "Frameworks & Libraries", "Django": "Frameworks & Libraries", "FastAPI": "Frameworks & Libraries", "Spring Boot": "Frameworks & Libraries", "Node.js": "Frameworks & Libraries", "Tailwind CSS": "Frameworks & Libraries", "HTML/CSS": "Frameworks & Libraries",
        "Manual Testing": "Testing & QA", "Selenium": "Testing & QA", "API Testing": "Testing & QA", "Pytest": "Testing & QA", "Automation Testing": "Testing & QA", "Cypress": "Testing & QA", "Postman": "Testing & QA",
        "Git": "General", "Agile": "General", "Jira": "General", "Stakeholder Management": "General", "System Design": "General", "Data Structures": "General", "Algorithms": "General", "ETL": "Data Engineering", "Spark": "Data Engineering", "Airflow": "Data Engineering", "Kafka": "Data Engineering", "Data Warehousing": "Data Engineering", "Data Cleaning": "Data Engineering", "Pandas": "Programming", "OpenCV": "Machine Learning", "Image Processing": "Machine Learning", "Network Security": "Quality & Security", "SIEM": "Quality & Security", "Vulnerability Assessment": "Quality & Security", "Wireshark": "Quality & Security", "Microservices": "Software Development", "Jenkins": "Cloud & DevOps", "Prometheus": "Cloud & DevOps", "Grafana": "Cloud & DevOps", "CUDA": "Machine Learning", "REST APIs": "Software Development"
    }
    
    # Save skills.csv
    skills_rows = []
    for s in sorted(all_skills_set):
        cat = skill_categories.get(s, "General")
        skills_rows.append({"skill_name": s, "normalized_name": s.lower().replace(" ", "_"), "category": cat})
    for s, cat in extra_skills:
        skills_rows.append({"skill_name": s, "normalized_name": s.lower().replace(" ", "_"), "category": cat})
        
    with open(DEMO_DIR / "skills.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["skill_name", "normalized_name", "category"])
        writer.writeheader()
        writer.writerows(skills_rows)
        
    # Save job_roles.csv
    role_rows = []
    for r in ROLES:
        role_rows.append({
            "canonical_title": r["title"],
            "category": r["category"],
            "description": r["desc"]
        })
    with open(DEMO_DIR / "job_roles.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["canonical_title", "category", "description"])
        writer.writeheader()
        writer.writerows(role_rows)

    # Save locations.csv
    with open(DEMO_DIR / "locations.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["city", "state", "country", "country_code", "tier", "col_index", "sal_mult"])
        writer.writeheader()
        writer.writerows(LOCATIONS)

    # Save role_skills.csv
    role_skills_rows = []
    for r in ROLES:
        for s in r["skills"]:
            # Realistic frequency distribution (core skills 70-95%, secondary 40-65%)
            freq = round(random.uniform(0.55, 0.92), 2)
            role_skills_rows.append({
                "role_title": r["title"],
                "skill_name": s,
                "frequency": freq
            })
    with open(DEMO_DIR / "role_skills.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["role_title", "skill_name", "frequency"])
        writer.writeheader()
        writer.writerows(role_skills_rows)

    # 3. Generate high-density realistic salary records with guaranteed cross-filter coverage
    salary_records = []
    
    # Stratified generation: 36 records per (role, location) pair to guarantee
    # every intersection has robust sample size across industries and employment types
    RECORDS_PER_PAIR = 36
    
    for role_info in ROLES:
        for loc_info in LOCATIONS:
            for k in range(RECORDS_PER_PAIR):
                # Cycle industries to guarantee every industry is represented for every role-city pair
                industry = INDUSTRIES[k % len(INDUSTRIES)]
                
                # Cycle employment types
                emp_type = EMPLOYMENT_TYPES[k % len(EMPLOYMENT_TYPES)]
                
                # Experience: spread across junior, mid, senior, lead
                # ensure diverse experience for every role-city combination
                exp_bracket_base = (k % 4) * 3.5  # 0, 3.5, 7.0, 10.5
                exp_noise = random.uniform(0.2, 3.2)
                exp = round(min(15.0, exp_bracket_base + exp_noise), 1)
                
                # Sample skills for this record (role core skills + optional extras)
                role_core = role_info["skills"]
                num_skills = random.randint(3, min(6, len(role_core)))
                chosen_skills = set(random.sample(role_core, num_skills))
                
                # 35% chance of an extra tangential skill (e.g. AWS, Docker, Linux, SQL)
                if random.random() < 0.35:
                    chosen_skills.add(random.choice(["AWS", "Docker", "Git", "SQL", "Linux"]))
                
                skills_list = sorted(list(chosen_skills))
                
                # Base salary progression formula
                # Experience growth curve: rapid early growth, leveling off
                exp_factor = 1.0 + (0.16 * exp) + (0.006 * (exp ** 1.6))
                
                # Base midpoint for role
                role_base = (role_info["base_min_lpa"] * 0.7 + role_info["base_max_lpa"] * 0.3)
                
                # Skill bonus (0.02 to 0.06 boost for specialized skill presence, e.g. PyTorch, Kubernetes)
                skill_boost = 1.0
                premium_skills = {"PyTorch", "Kubernetes", "MLOps", "LLMs", "Kafka", "Terraform", "System Design"}
                for ps in premium_skills:
                    if ps in skills_list:
                        skill_boost += 0.035
                        
                # Industry factor
                ind_mult = 1.0
                if industry == "Fintech": ind_mult = 1.12
                elif industry == "Enterprise Software": ind_mult = 1.08
                elif industry == "EdTech": ind_mult = 0.94
                
                emp_mult = 1.10 if emp_type == "Contract" else 1.0
                loc_mult = loc_info["sal_mult"]
                
                # Random noise / variance (log-normal feel)
                noise = random.gauss(1.0, 0.10)
                
                annual_lpa = role_base * exp_factor * skill_boost * ind_mult * loc_mult * emp_mult * noise
                
                # Bound sensibly
                min_floor = max(role_info["base_min_lpa"] * 0.8, 2.8)
                annual_lpa = max(min_floor, annual_lpa)
                
                # 2% chance of an executive / outlier package (e.g. high-growth tier)
                if random.random() < 0.02 and exp > 6.0:
                    annual_lpa *= 1.45
                    
                annual_inr = round(annual_lpa * 100000.0, -3)  # rounded to thousands
                
                # Period & Currency representation
                # 85% annual INR, 12% monthly INR, 3% international USD equivalent
                rnd_fmt = random.random()
                if rnd_fmt < 0.85:
                    orig_sal = annual_inr
                    orig_curr = "INR"
                    period = "annual"
                elif rnd_fmt < 0.97:
                    orig_sal = round(annual_inr / 12.0, -2)
                    orig_curr = "INR"
                    period = "monthly"
                else:
                    orig_sal = round(annual_inr / 83.5, -1)
                    orig_curr = "USD"
                    period = "annual"
                    
                survey_year = random.choice([2024, 2024, 2025])
                
                salary_records.append({
                    "job_title": role_info["title"],
                    "role_category": role_info["category"],
                    "city": loc_info["city"],
                    "state": loc_info["state"],
                    "country": loc_info["country"],
                    "experience_years": exp,
                    "industry": industry,
                    "employment_type": emp_type,
                    "skills": ";".join(skills_list),
                    "original_salary": orig_sal,
                    "original_currency": orig_curr,
                    "compensation_period": period,
                    "normalized_annual_salary": annual_inr,
                    "normalized_currency": "INR",
                    "survey_year": survey_year,
                    "is_synthetic": True
                })

    with open(DEMO_DIR / "salary_records.csv", "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "job_title", "role_category", "city", "state", "country",
            "experience_years", "industry", "employment_type", "skills",
            "original_salary", "original_currency", "compensation_period",
            "normalized_annual_salary", "normalized_currency", "survey_year",
            "is_synthetic"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(salary_records)
        
    # 4. Save dataset_metadata.json
    metadata = {
        "dataset_name": "SALVERA Benchmark Tech Salary Corpus 2024-2025",
        "source_name": "SALVERA Synthetic Benchmark Calibration Engine",
        "source_url": "local://data/demo/salary_records.csv",
        "licence": "Creative Commons CC-BY 4.0",
        "collection_period": "2024-2025",
        "record_count": len(salary_records),
        "total_roles": len(ROLES),
        "total_locations": len(LOCATIONS),
        "total_skills": len(skills_rows),
        "is_synthetic": True,
        "synthetic_disclosure": "DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY.",
        "currencies_represented": ["INR", "USD"],
        "normalization_base": "INR Annualized (1 USD = 83.50 INR)"
    }
    with open(DEMO_DIR / "dataset_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 5. Save data/demo/README.md
    readme_content = f"""# SALVERA Benchmark Demonstration Dataset

**Label:** DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY.

## Overview
This directory contains calibrated, statistically realistic demonstration data for SALVERA, spanning {len(ROLES)} technology roles across {len(LOCATIONS)} Indian tech hubs (Chennai, Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Coimbatore).

## Files
- `salary_records.csv`: {len(salary_records)} records with normalized compensation, experience, role categories, skills, and industry attribution.
- `job_roles.csv`: Standardized technology role taxonomy and categories.
- `skills.csv`: Skill dictionary categorized by domain.
- `locations.csv`: City metadata with Tier classification and cost-of-living index.
- `role_skills.csv`: Empirical skill co-occurrence frequencies per role.
- `dataset_metadata.json`: Dataset provenance, license, and calibration metadata.

## Provenance & Disclaimer
All records in this dataset carry `is_synthetic = true`. They are generated via log-normal multi-factor compensation distributions reflecting real-world market spreads, designed for offline local execution, algorithm benchmarking, and end-to-end user workflows without requiring external paid APIs.
"""
    with open(DEMO_DIR / "README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)

    print(f"Successfully generated {len(salary_records)} demo records in {DEMO_DIR}")

if __name__ == "__main__":
    generate()
