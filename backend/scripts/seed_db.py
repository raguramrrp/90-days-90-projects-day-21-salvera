import sys
import json
import csv
from datetime import datetime
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.database.session import engine, init_db, SessionLocal
from backend.app.database.models import (
    Dataset, JobRole, Skill, RoleSkill, Location,
    SalaryRecord, UserProfile, UserProfileSkill,
    OfferComparison, JobOffer, CareerPlan, CareerPlanSkill,
    Watchlist, ImportLog
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEMO_DIR = BASE_DIR / "data" / "demo"

def seed_database():
    print("Initializing database tables...")
    init_db()
    db: Session = SessionLocal()
    
    try:
        # Check if dataset already loaded
        existing_dataset = db.query(Dataset).filter(Dataset.dataset_name.like("%SALVERA%")).first()
        if existing_dataset:
            print(f"Dataset already exists with {existing_dataset.record_count} records. Re-seeding clean state...")
            db.query(SalaryRecord).delete()
            db.query(RoleSkill).delete()
            db.query(JobOffer).delete()
            db.query(OfferComparison).delete()
            db.query(CareerPlanSkill).delete()
            db.query(CareerPlan).delete()
            db.query(Watchlist).delete()
            db.query(UserProfileSkill).delete()
            db.query(UserProfile).delete()
            db.query(Dataset).delete()
            db.query(JobRole).delete()
            db.query(Skill).delete()
            db.query(Location).delete()
            db.commit()

        # 1. Load Dataset Metadata
        meta_path = DEMO_DIR / "dataset_metadata.json"
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        else:
            meta = {
                "dataset_name": "SALVERA Benchmark Tech Salary Corpus 2024-2025",
                "source_name": "SALVERA Synthetic Benchmark Calibration Engine",
                "source_url": "local://data/demo/salary_records.csv",
                "licence": "Creative Commons CC-BY 4.0",
                "collection_period": "2024-2025",
                "record_count": 2250,
                "is_synthetic": True,
                "synthetic_disclosure": "DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY."
            }

        dataset = Dataset(
            dataset_name=meta.get("dataset_name", "SALVERA Tech Salary Benchmark"),
            source_name=meta.get("source_name", "SALVERA Calibration Engine"),
            source_url=meta.get("source_url"),
            licence=meta.get("licence", "CC-BY 4.0"),
            collection_period=meta.get("collection_period", "2024-2025"),
            record_count=0,
            is_synthetic=True,
            status="ready",
            quality_score=97.5,
            metadata_json=meta
        )
        db.add(dataset)
        db.flush()

        # 2. Seed Skills
        skill_map = {}
        with open(DEMO_DIR / "skills.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                s_name = row["skill_name"].strip()
                if s_name not in skill_map:
                    skill_obj = Skill(
                        skill_name=s_name,
                        normalized_name=row.get("normalized_name", s_name.lower().replace(" ", "_")),
                        category=row.get("category", "General")
                    )
                    db.add(skill_obj)
                    db.flush()
                    skill_map[s_name] = skill_obj.id

        # 3. Seed Job Roles
        role_map = {}
        with open(DEMO_DIR / "job_roles.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                r_title = row["canonical_title"].strip()
                if r_title not in role_map:
                    role_obj = JobRole(
                        canonical_title=r_title,
                        category=row.get("category", "Software Development"),
                        description=row.get("description", "")
                    )
                    db.add(role_obj)
                    db.flush()
                    role_map[r_title] = role_obj.id

        # 4. Seed Locations
        loc_map = {}
        with open(DEMO_DIR / "locations.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city = row["city"].strip()
                if city not in loc_map:
                    loc_obj = Location(
                        city=city,
                        state=row.get("state", ""),
                        country=row.get("country", "India"),
                        country_code=row.get("country_code", "IND"),
                        tier=row.get("tier", "Tier 1"),
                        col_index=float(row.get("col_index", 100.0))
                    )
                    db.add(loc_obj)
                    db.flush()
                    loc_map[city] = loc_obj.id

        # 5. Seed Role Skills
        with open(DEMO_DIR / "role_skills.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                r_title = row["role_title"].strip()
                s_name = row["skill_name"].strip()
                if r_title in role_map and s_name in skill_map:
                    rs = RoleSkill(
                        role_id=role_map[r_title],
                        skill_id=skill_map[s_name],
                        frequency=float(row.get("frequency", 0.70)),
                        source_dataset_id=dataset.id
                    )
                    db.add(rs)

        # 6. Seed Salary Records
        records_to_add = []
        with open(DEMO_DIR / "salary_records.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                r_title = row["job_title"].strip()
                city = row["city"].strip()
                if r_title in role_map and city in loc_map:
                    skills_list = [s.strip() for s in row.get("skills", "").split(";") if s.strip()]
                    rec = SalaryRecord(
                        dataset_id=dataset.id,
                        role_id=role_map[r_title],
                        location_id=loc_map[city],
                        experience_years=float(row.get("experience_years", 2.0)),
                        industry=row.get("industry", "Information Technology"),
                        employment_type=row.get("employment_type", "Full-time"),
                        skills_list=skills_list,
                        original_salary=float(row.get("original_salary", 0.0)),
                        original_currency=row.get("original_currency", "INR"),
                        compensation_period=row.get("compensation_period", "annual"),
                        normalized_annual_salary=float(row.get("normalized_annual_salary", 0.0)),
                        normalized_currency=row.get("normalized_currency", "INR"),
                        survey_year=int(row.get("survey_year", 2024)),
                        is_synthetic=True
                    )
                    records_to_add.append(rec)

        db.bulk_save_objects(records_to_add)
        dataset.record_count = len(records_to_add)
        
        # 7. Seed Import Log
        import_log = ImportLog(
            dataset_id=dataset.id,
            filename="salary_records.csv",
            total_rows=len(records_to_add),
            imported_rows=len(records_to_add),
            rejected_rows=0,
            duplicate_rows=0,
            error_summary={"status": "clean", "validation": "All rows passed schema check"}
        )
        db.add(import_log)

        # 8. Seed Demo User Profile
        user_prof = UserProfile(
            profile_name="Ragu Ram P",
            current_role="Aspiring AI & Data Science Engineer",
            experience_years=1.5,
            preferred_location="Bengaluru"
        )
        db.add(user_prof)
        db.flush()

        for s_name in ["Python", "SQL", "Scikit-learn", "FastAPI", "React", "Tableau"]:
            db.add(UserProfileSkill(
                profile_id=user_prof.id,
                skill_name=s_name,
                proficiency_level="Advanced" if s_name in ["Python", "SQL"] else "Intermediate"
            ))

        # 9. Seed Demo Offer Comparison in Offer Studio
        offer_comp = OfferComparison(
            profile_id=user_prof.id,
            comparison_name="Q1 Tech Offer Evaluation",
            notes="Evaluating Bengaluru Product Unicorn vs Hyderabad Fintech Growth Stage"
        )
        db.add(offer_comp)
        db.flush()

        offer_1 = JobOffer(
            comparison_id=offer_comp.id,
            offer_name="Offer A: ZetaScale Tech",
            company_name="ZetaScale Systems",
            role_title="Machine Learning Engineer",
            location_name="Bengaluru",
            work_mode="Hybrid",
            fixed_salary=1600000.0,
            variable_salary=200000.0,
            joining_bonus=150000.0,
            annual_benefits=120000.0,
            monthly_deductions=28000.0,
            monthly_rent=25000.0,
            monthly_commute=4000.0,
            other_monthly_expenses=12000.0
        )
        offer_2 = JobOffer(
            comparison_id=offer_comp.id,
            offer_name="Offer B: NexaFin Solutions",
            company_name="NexaFin Capital",
            role_title="Data Scientist",
            location_name="Hyderabad",
            work_mode="Remote",
            fixed_salary=1450000.0,
            variable_salary=300000.0,
            joining_bonus=200000.0,
            annual_benefits=80000.0,
            monthly_deductions=24000.0,
            monthly_rent=16000.0,
            monthly_commute=1500.0,
            other_monthly_expenses=9000.0
        )
        db.add(offer_1)
        db.add(offer_2)

        # 10. Seed Demo Career Plan
        target_role_id = role_map.get("Machine Learning Engineer", list(role_map.values())[0])
        career_plan = CareerPlan(
            profile_id=user_prof.id,
            current_role="Junior Data Analyst",
            target_role_id=target_role_id,
            target_role_title="Machine Learning Engineer",
            target_date="2025-12-31",
            target_salary_expectation=1800000.0
        )
        db.add(career_plan)
        db.flush()

        roadmap_items = [
            ("Advanced Statistics & Hypothesis Testing", "core_gap", "High", "Completed", 1, "Mastered p-values, ANOVA, regression distributions"),
            ("Scikit-Learn Machine Learning Pipelines", "core_gap", "High", "In Progress", 2, "Building ColumnTransformers, cross-validation"),
            ("PyTorch Deep Learning & Tensor Operations", "core_gap", "High", "Planned", 3, "Neural architecture fundamentals"),
            ("Docker & Containerization for Models", "recommended_addition", "Medium", "Planned", 4, "Packaging inference servers"),
            ("MLOps & FastAPI Model Deployment", "recommended_addition", "High", "Planned", 5, "Latency SLAs and model versioning"),
            ("Kubernetes & Scaled Serving", "advanced_specialization", "Low", "Planned", 6, "Multi-node inference deployment")
        ]
        for skill_n, cat, prio, stat, ord_idx, note in roadmap_items:
            db.add(CareerPlanSkill(
                career_plan_id=career_plan.id,
                skill_name=skill_n,
                category=cat,
                priority=prio,
                completion_status=stat,
                order_index=ord_idx,
                target_date="2025-06-30",
                notes=note
            ))

        # 11. Seed Default Market Watchlist
        db.add(Watchlist(
            profile_id=user_prof.id,
            item_type="role",
            item_name="Data Scientist",
            baseline_median_salary=1450000.0,
            baseline_sample_count=180
        ))
        db.add(Watchlist(
            profile_id=user_prof.id,
            item_type="role",
            item_name="Machine Learning Engineer",
            baseline_median_salary=1820000.0,
            baseline_sample_count=165
        ))
        db.add(Watchlist(
            profile_id=user_prof.id,
            item_type="skill",
            item_name="PyTorch",
            baseline_median_salary=1750000.0,
            baseline_sample_count=210
        ))
        db.add(Watchlist(
            profile_id=user_prof.id,
            item_type="location",
            item_name="Bengaluru",
            baseline_median_salary=1380000.0,
            baseline_sample_count=450
        ))

        db.commit()
        print(f"Successfully seeded database: {len(records_to_add)} salary records, {len(role_map)} roles, {len(skill_map)} skills, {len(loc_map)} locations!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
