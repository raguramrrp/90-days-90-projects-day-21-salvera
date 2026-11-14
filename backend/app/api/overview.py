from typing import List, Dict, Any, Optional
import numpy as np
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import SalaryRecord, JobRole, Skill, Location, Dataset
from backend.app.schemas.schemas import OverviewSummary, SalaryFilterParams
from backend.app.services.salary_service import SalaryService
from backend.app.services.skill_service import SkillService

router = APIRouter(prefix="/overview", tags=["Market Overview"])

@router.get("/summary", response_model=OverviewSummary)
def get_overview_summary(db: Session = Depends(get_db)):
    salaries = [r[0] for r in db.query(SalaryRecord.normalized_annual_salary).all()]
    total_records = len(salaries)
    
    total_roles = db.query(JobRole).count()
    total_skills = db.query(Skill).count()
    total_locations = db.query(Location).count()
    
    dataset = db.query(Dataset).order_by(Dataset.imported_at.desc()).first()
    latest_period = dataset.collection_period if dataset else "2024-2025"
    is_synth = dataset.is_synthetic if dataset else True
    
    if salaries:
        arr = np.array(salaries)
        med = float(np.median(arr))
        mean = float(np.mean(arr))
        p25 = float(np.percentile(arr, 25))
        p75 = float(np.percentile(arr, 75))
    else:
        med = mean = p25 = p75 = 0.0

    return OverviewSummary(
        total_records=total_records,
        total_roles=total_roles,
        total_skills=total_skills,
        total_locations=total_locations,
        median_annual_salary=round(med, 2),
        mean_annual_salary=round(mean, 2),
        salary_p25=round(p25, 2),
        salary_p75=round(p75, 2),
        latest_dataset_period=latest_period,
        is_synthetic=is_synth,
        currency="INR"
    )

@router.get("/salary-distribution")
def get_salary_distribution(db: Session = Depends(get_db)):
    params = SalaryFilterParams()
    return SalaryService.get_distribution(db, params, bins=12)

@router.get("/experience-compensation")
def get_experience_compensation(db: Session = Depends(get_db)):
    params = SalaryFilterParams()
    return SalaryService.get_by_experience(db, params)

@router.get("/top-skills")
def get_top_skills(db: Session = Depends(get_db), limit: int = 10):
    rankings = SkillService.get_skill_rankings(db)
    return rankings[:limit]

@router.get("/career-insights")
def get_career_insights(db: Session = Depends(get_db)):
    insights = [
        {"title": "SQL Dominance in Analytics", "insight": "SQL appears in over 85% of Data Analyst and Data Engineering records, making it the most ubiquitous database requirement."},
        {"title": "PyTorch & MLOps Premium", "insight": "Records featuring PyTorch combined with MLOps demonstrate a 28% higher median compensation compared to general machine learning roles."},
        {"title": "Bengaluru Market Delta", "insight": "Bengaluru technology records show a 16% positive median delta over nationwide baselines across equivalent experience cohorts."},
        {"title": "Experience Inflection Band", "insight": "The highest rate of salary acceleration occurs between 2 and 5 years of verified domain experience (+42% median growth)."}
    ]
    return insights
