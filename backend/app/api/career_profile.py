"""
Career Profile & Preferences API Router.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import UserJobPreference
from backend.app.schemas.schemas import CareerProfileIn, CareerProfileOut
from backend.app.jobs.services.job_recommendation_service import JobRecommendationService

router = APIRouter(prefix="/career-profile", tags=["Career Profile"])

@router.get("", response_model=CareerProfileOut)
def get_career_profile(db: Session = Depends(get_db)):
    profile = JobRecommendationService.get_or_create_default_profile(db, user_id="default_user")
    return CareerProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        profile_title=profile.profile_title,
        candidate_type=profile.candidate_type,
        target_roles=profile.target_roles or [],
        primary_skills=profile.primary_skills or [],
        secondary_skills=profile.secondary_skills or [],
        experience_years=profile.experience_years or 0.0,
        current_city=profile.current_city or "Chennai",
        preferred_cities=profile.preferred_cities or [],
        preferred_work_modes=profile.preferred_work_modes or [],
        preferred_employment_types=profile.preferred_employment_types or [],
        min_expected_salary=profile.min_expected_salary or 0.0,
        education_degree=profile.education_degree,
        graduation_year=profile.graduation_year,
        updated_at=profile.updated_at
    )

@router.put("", response_model=CareerProfileOut)
def update_career_profile(payload: CareerProfileIn, db: Session = Depends(get_db)):
    profile = JobRecommendationService.get_or_create_default_profile(db, user_id="default_user")
    
    profile.profile_title = payload.profile_title
    profile.candidate_type = payload.candidate_type
    profile.target_roles = payload.target_roles
    profile.primary_skills = payload.primary_skills
    profile.secondary_skills = payload.secondary_skills
    profile.experience_years = payload.experience_years
    profile.current_city = payload.current_city
    profile.preferred_cities = payload.preferred_cities
    profile.preferred_work_modes = payload.preferred_work_modes
    profile.preferred_employment_types = payload.preferred_employment_types
    profile.min_expected_salary = payload.min_expected_salary
    profile.education_degree = payload.education_degree
    profile.graduation_year = payload.graduation_year

    db.commit()
    db.refresh(profile)

    return CareerProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        profile_title=profile.profile_title,
        candidate_type=profile.candidate_type,
        target_roles=profile.target_roles or [],
        primary_skills=profile.primary_skills or [],
        secondary_skills=profile.secondary_skills or [],
        experience_years=profile.experience_years or 0.0,
        current_city=profile.current_city or "Chennai",
        preferred_cities=profile.preferred_cities or [],
        preferred_work_modes=profile.preferred_work_modes or [],
        preferred_employment_types=profile.preferred_employment_types or [],
        min_expected_salary=profile.min_expected_salary or 0.0,
        education_degree=profile.education_degree,
        graduation_year=profile.graduation_year,
        updated_at=profile.updated_at
    )
