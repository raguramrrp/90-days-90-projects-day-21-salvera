"""
Jobs API Router for India-First Tech Job Discovery.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.schemas import (
    JobFilterParams, PaginatedJobsOut, JobDetailOut, JobListingOut,
    CareerProfileOut
)
from backend.app.jobs.services.job_service import JobService
from backend.app.jobs.services.job_recommendation_service import JobRecommendationService
from backend.app.jobs.services.job_activity_service import JobActivityService
from backend.app.database.models import UserJobPreference

router = APIRouter(prefix="/jobs", tags=["Jobs Discovery"])

@router.get("/search", response_model=PaginatedJobsOut)
def search_jobs(
    query: Optional[str] = None,
    role: Optional[str] = None,
    city: Optional[str] = None,
    skills: Optional[str] = None,
    experience_level: Optional[str] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    work_mode: Optional[str] = None,
    employment_type: Optional[str] = None,
    salary_disclosed_only: Optional[bool] = False,
    min_salary: Optional[float] = None,
    freshness_days: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("recent"),
    db: Session = Depends(get_db)
):
    params = JobFilterParams(
        query=query,
        role=role,
        city=city,
        skills=skills,
        experience_level=experience_level,
        min_experience=min_experience,
        max_experience=max_experience,
        work_mode=work_mode,
        employment_type=employment_type,
        salary_disclosed_only=salary_disclosed_only,
        min_salary=min_salary,
        freshness_days=freshness_days,
        page=page,
        page_size=page_size,
        sort_by=sort_by
    )
    return JobService.search_jobs(db, params)

@router.get("/filters/metadata")
def get_job_filter_metadata(db: Session = Depends(get_db)):
    """
    Returns populated filter options based on India-first job corpus.
    """
    JobService.seed_initial_jobs_if_empty(db)
    return {
        "cities": [
            "All Cities", "Bengaluru", "Chennai", "Hyderabad", "Pune", 
            "Mumbai", "Delhi NCR", "Coimbatore", "Tirunelveli", 
            "Madurai", "Kochi", "Thiruvananthapuram", "Kolkata", "Ahmedabad"
        ],
        "work_modes": ["All Modes", "On-site", "Hybrid", "Remote"],
        "employment_types": ["All Types", "Full-time", "Internship"],
        "experience_levels": [
            {"label": "All Levels", "value": ""},
            {"label": "Fresher / Graduate (0–1 yrs)", "value": "fresher"},
            {"label": "Junior (1–3 yrs)", "value": "junior"},
            {"label": "Mid-Level (3–6 yrs)", "value": "mid"},
            {"label": "Senior (6+ yrs)", "value": "senior"}
        ],
        "freshness_options": [
            {"label": "Any time", "value": None},
            {"label": "Past 24 hours", "value": 1},
            {"label": "Past 3 days", "value": 3},
            {"label": "Past 7 days", "value": 7},
            {"label": "Past 14 days", "value": 14}
        ]
    }

@router.get("/recommended", response_model=List[JobListingOut])
def get_recommended_jobs(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return JobRecommendationService.get_personalized_recommendations(db, user_id="default_user", limit=limit)

@router.get("/{job_id}", response_model=JobDetailOut)
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db)
):
    # Fetch user skills for alignment comparison
    pref = db.query(UserJobPreference).filter(UserJobPreference.user_id == "default_user").first()
    user_skills = []
    if pref:
        user_skills = (pref.primary_skills or []) + (pref.secondary_skills or [])

    job = JobService.get_job_detail(db, job_id, user_id="default_user", user_skills=user_skills)
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    return job

@router.post("/{job_id}/save")
def toggle_save_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    return JobActivityService.toggle_save_job(db, job_id=job_id, user_id="default_user")
