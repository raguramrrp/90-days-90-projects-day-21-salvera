"""
Explainable Recommendation Engine for SALVERA.
Implements multi-factor weighted scoring and generates transparent matching rationales.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.models import (
    JobListing, UserJobPreference, JobSkill, SavedJob, JobApplication
)
from backend.app.schemas.schemas import JobListingOut

class JobRecommendationService:

    @classmethod
    def get_or_create_default_profile(cls, db: Session, user_id: str = "default_user") -> UserJobPreference:
        profile = db.query(UserJobPreference).filter(UserJobPreference.user_id == user_id).first()
        if not profile:
            profile = UserJobPreference(
                user_id=user_id,
                profile_title="Data & AI Aspirant",
                candidate_type="Student",
                target_roles=["Data Analyst", "Machine Learning Engineer", "Software Engineer"],
                primary_skills=["Python", "SQL", "Power BI", "Pandas", "Machine Learning"],
                secondary_skills=["Git", "Docker", "FastAPI"],
                experience_years=0.5,
                current_city="Chennai",
                preferred_cities=["Chennai", "Bengaluru", "Hyderabad", "Coimbatore"],
                preferred_work_modes=["Hybrid", "Remote", "On-site"],
                preferred_employment_types=["Full-time", "Internship"],
                min_expected_salary=450000.0,
                education_degree="B.Tech Artificial Intelligence & Data Science",
                graduation_year=2025
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @classmethod
    def calculate_job_match(
        cls, 
        job: JobListing, 
        job_skills: List[JobSkill], 
        profile: UserJobPreference
    ) -> Dict[str, Any]:
        """
        Calculates explainable match score (0 - 100) and human-readable reasons.
        Weights:
        - Skill overlap: 40%
        - Role title relevance: 25%
        - Experience fit: 15%
        - Location match: 10%
        - Work mode match: 10%
        """
        reasons: List[str] = []
        user_skills = set(s.strip().lower() for s in (profile.primary_skills or []) + (profile.secondary_skills or []))
        
        # 1. Skill Score (40 pts)
        req_skills = [js.skill_name for js in job_skills if js.skill_type == "required"]
        pref_skills = [js.skill_name for js in job_skills if js.skill_type == "preferred"]
        
        # Fallback if job_skills empty, use skills_raw
        if not req_skills and not pref_skills and job.skills_raw:
            req_skills = job.skills_raw

        matched_req = [s for s in req_skills if s.strip().lower() in user_skills]
        matched_pref = [s for s in pref_skills if s.strip().lower() in user_skills]

        skill_pts = 0.0
        if req_skills:
            req_ratio = len(matched_req) / len(req_skills)
            skill_pts += req_ratio * 30.0  # 30 pts for required
            if matched_req:
                reasons.append(f"Matches {len(matched_req)} of {len(req_skills)} required skills ({', '.join(matched_req[:3])})")
        else:
            skill_pts += 25.0

        if pref_skills:
            pref_ratio = len(matched_pref) / len(pref_skills)
            skill_pts += pref_ratio * 10.0  # 10 pts for preferred
            if matched_pref:
                reasons.append(f"Includes {len(matched_pref)} preferred skills ({', '.join(matched_pref[:2])})")
        else:
            skill_pts += 10.0

        # 2. Role Relevance (25 pts)
        role_pts = 0.0
        target_roles = [r.strip().lower() for r in (profile.target_roles or [])]
        job_title_lower = job.title.lower()

        for target in target_roles:
            if target in job_title_lower:
                role_pts = 25.0
                reasons.append(f"Direct match for your target role '{target.title()}'")
                break
            # Partial token overlap
            tokens = target.split()
            if any(t in job_title_lower for t in tokens if len(t) > 3):
                role_pts = max(role_pts, 15.0)

        if role_pts == 0 and not target_roles:
            role_pts = 20.0

        # 3. Experience Fit (15 pts)
        exp_pts = 0.0
        user_exp = profile.experience_years or 0.0
        if job.experience_min <= user_exp <= job.experience_max:
            exp_pts = 15.0
            reasons.append(f"Your experience ({user_exp}y) fits the {job.experience_min}–{job.experience_max}y criteria")
        elif user_exp < job.experience_min and (job.experience_min - user_exp) <= 1.0:
            exp_pts = 8.0
            reasons.append(f"Close experience match (requires {job.experience_min}y, you have {user_exp}y)")
        elif user_exp > job.experience_max and (user_exp - job.experience_max) <= 2.0:
            exp_pts = 10.0
        else:
            exp_pts = 4.0

        # 4. Location Match (10 pts)
        loc_pts = 0.0
        pref_cities = [c.strip().lower() for c in (profile.preferred_cities or [])]
        current_city = (profile.current_city or "").strip().lower()
        job_city = job.city.lower()

        if job.work_mode.lower() == "remote":
            loc_pts = 10.0
            reasons.append("Remote position open to candidates across India")
        elif job_city in pref_cities or job_city == current_city:
            loc_pts = 10.0
            reasons.append(f"Based in your preferred location ({job.city})")
        else:
            loc_pts = 3.0

        # 5. Work Mode Match (10 pts)
        mode_pts = 0.0
        pref_modes = [m.strip().lower() for m in (profile.preferred_work_modes or [])]
        if not pref_modes or job.work_mode.lower() in pref_modes:
            mode_pts = 10.0
            reasons.append(f"Offers {job.work_mode} arrangement as requested")
        else:
            mode_pts = 4.0

        total_score = round(skill_pts + role_pts + exp_pts + loc_pts + mode_pts, 1)
        total_score = min(100.0, max(0.0, total_score))

        return {
            "score": total_score,
            "reasons": reasons[:4]  # Return top 4 most pertinent reasons
        }

    @classmethod
    def get_personalized_recommendations(
        cls, 
        db: Session, 
        user_id: str = "default_user",
        limit: int = 20
    ) -> List[JobListingOut]:
        """
        Generates top personalized job recommendations for the user.
        """
        profile = cls.get_or_create_default_profile(db, user_id)
        
        # Pull active jobs in India
        jobs = db.query(JobListing).filter(
            JobListing.country == "India",
            JobListing.is_active == True
        ).all()

        saved_ids = set(s[0] for s in db.query(SavedJob.job_id).filter(SavedJob.user_id == user_id).all())
        app_status_map = {
            a.job_id: a.status for a in db.query(JobApplication).filter(JobApplication.user_id == user_id).all()
        }

        scored_jobs = []
        for j in jobs:
            skills = j.job_skills
            match_data = cls.calculate_job_match(j, skills, profile)
            scored_jobs.append((j, match_data))

        # Sort by match score descending
        scored_jobs.sort(key=lambda x: x[1]["score"], reverse=True)

        recommendations: List[JobListingOut] = []
        for job, match in scored_jobs[:limit]:
            recommendations.append(JobListingOut(
                id=job.id,
                source_id=job.source_id,
                source_name=job.source.source_name if job.source else "Curated Feed",
                title=job.title,
                company_name=job.company_name,
                company_logo_url=job.company_logo_url,
                city=job.city,
                state=job.state,
                country=job.country,
                is_remote_eligible_india=job.is_remote_eligible_india,
                work_mode=job.work_mode,
                employment_type=job.employment_type,
                experience_min=job.experience_min,
                experience_max=job.experience_max,
                salary_disclosed=job.salary_disclosed,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                salary_currency=job.salary_currency,
                salary_period=job.salary_period,
                skills_raw=job.skills_raw or [],
                apply_url=job.apply_url,
                posted_at=job.posted_at,
                is_active=job.is_active,
                is_synthetic=job.is_synthetic,
                is_saved=job.id in saved_ids,
                application_status=app_status_map.get(job.id),
                match_score=match["score"],
                match_reasons=match["reasons"]
            ))

        return recommendations
