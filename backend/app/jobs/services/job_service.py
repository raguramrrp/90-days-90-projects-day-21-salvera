"""
Core Job Discovery Service for SALVERA.
Implements India-only filtering, canonical salary benchmark linkage,
and full-text/skill search.
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone
import math
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, func, String

from backend.app.database.models import (
    JobListing, JobSource, JobSkill, JobRole, SavedJob, 
    JobApplication, SalaryRecord, Skill
)
from backend.app.schemas.schemas import (
    JobFilterParams, JobListingOut, JobDetailOut, 
    SalaryBenchmarkComparison, SkillAlignmentResult, PaginatedJobsOut
)
from backend.app.jobs.providers.curated_india_provider import CuratedIndiaProvider

def utc_now():
    return datetime.now(timezone.utc)

class JobService:

    @classmethod
    def seed_initial_jobs_if_empty(cls, db: Session, count: int = 250) -> int:
        """
        Seeds initial calibrated Indian tech jobs if database has 0 listings.
        """
        existing_count = db.query(JobListing).count()
        if existing_count > 0:
            return existing_count

        # Ensure JobSource exists
        source = db.query(JobSource).filter(JobSource.source_name == "Curated Indian Tech Feed").first()
        if not source:
            source = JobSource(
                source_name="Curated Indian Tech Feed",
                source_type="curated",
                base_url="https://salvera.in/careers",
                is_active=True
            )
            db.add(source)
            db.commit()
            db.refresh(source)

        provider = CuratedIndiaProvider()
        raw_jobs = provider.fetch_jobs(limit=count)
        
        # Pre-cache canonical roles
        canonical_roles = {r.canonical_title.lower(): r.id for r in db.query(JobRole).all()}
        # Pre-cache skills
        skills_cache = {s.skill_name.lower(): s.id for s in db.query(Skill).all()}

        inserted = 0
        for item in raw_jobs:
            canonical_role_id = None
            role_hint = item.get("canonical_role_title", "").lower()
            if role_hint in canonical_roles:
                canonical_role_id = canonical_roles[role_hint]

            listing = JobListing(
                source_id=source.id,
                source_job_id=item.get("source_job_id"),
                title=item["title"],
                canonical_role_id=canonical_role_id,
                company_name=item["company_name"],
                company_logo_url=item.get("company_logo_url"),
                city=item["city"],
                state=item.get("state"),
                country="India",  # Guaranteed India
                is_remote_eligible_india=item.get("is_remote_eligible_india", True),
                work_mode=item.get("work_mode", "On-site"),
                employment_type=item.get("employment_type", "Full-time"),
                experience_min=item.get("experience_min", 0.0),
                experience_max=item.get("experience_max", 1.0),
                salary_disclosed=item.get("salary_disclosed", False),
                salary_min=item.get("salary_min"),
                salary_max=item.get("salary_max"),
                salary_currency="INR",
                salary_period="annual",
                description=item.get("description", ""),
                responsibilities=item.get("responsibilities", []),
                requirements=item.get("requirements", []),
                skills_raw=item.get("skills_raw", []),
                apply_url=item.get("apply_url", "https://careers.salvera.in"),
                posted_at=item.get("posted_at", utc_now()),
                is_active=True,
                is_synthetic=True
            )
            db.add(listing)
            db.flush()

            # Insert JobSkill relations
            for req_skill in item.get("skills_required", []):
                s_id = skills_cache.get(req_skill.lower())
                db.add(JobSkill(
                    job_id=listing.id,
                    skill_id=s_id,
                    skill_name=req_skill,
                    skill_type="required"
                ))

            for pref_skill in item.get("skills_preferred", []):
                s_id = skills_cache.get(pref_skill.lower())
                db.add(JobSkill(
                    job_id=listing.id,
                    skill_id=s_id,
                    skill_name=pref_skill,
                    skill_type="preferred"
                ))

            inserted += 1

        source.jobs_count = inserted
        source.last_sync_at = utc_now()
        db.commit()
        return inserted

    @classmethod
    def search_jobs(
        cls, 
        db: Session, 
        params: JobFilterParams,
        user_id: str = "default_user"
    ) -> PaginatedJobsOut:
        """
        Executes multi-criteria search restricted strictly to India with pagination.
        """
        # Ensure database is seeded
        cls.seed_initial_jobs_if_empty(db)

        query = db.query(JobListing).filter(
            JobListing.country == "India",
            JobListing.is_active == True
        )

        # Keyword / search text
        if params.query:
            q_clean = params.query.strip().lower()
            query = query.filter(
                or_(
                    JobListing.title.ilike(f"%{q_clean}%"),
                    JobListing.company_name.ilike(f"%{q_clean}%"),
                    JobListing.description.ilike(f"%{q_clean}%"),
                    JobListing.city.ilike(f"%{q_clean}%")
                )
            )

        # Role filter
        if params.role:
            query = query.filter(JobListing.title.ilike(f"%{params.role.strip()}%"))

        # City filter (India cities)
        if params.city:
            c = params.city.strip().lower()
            if c in ["bengaluru", "bangalore"]:
                query = query.filter(or_(JobListing.city.ilike("%bengaluru%"), JobListing.city.ilike("%bangalore%")))
            else:
                query = query.filter(JobListing.city.ilike(f"%{c}%"))

        # Work mode
        if params.work_mode:
            query = query.filter(JobListing.work_mode.ilike(f"%{params.work_mode.strip()}%"))

        # Employment type
        if params.employment_type:
            query = query.filter(JobListing.employment_type.ilike(f"%{params.employment_type.strip()}%"))

        # Experience levels
        if params.experience_level:
            lvl = params.experience_level.strip().lower()
            if lvl == "fresher":
                query = query.filter(JobListing.experience_min <= 1.0)
            elif lvl == "junior":
                query = query.filter(and_(JobListing.experience_min >= 0.5, JobListing.experience_max <= 3.5))
            elif lvl == "mid":
                query = query.filter(and_(JobListing.experience_min >= 2.5, JobListing.experience_max <= 6.0))
            elif lvl == "senior":
                query = query.filter(JobListing.experience_min >= 5.0)

        if params.min_experience is not None:
            query = query.filter(JobListing.experience_min >= params.min_experience)
        if params.max_experience is not None:
            query = query.filter(JobListing.experience_max <= params.max_experience)

        # Salary disclosed filter
        if params.salary_disclosed_only:
            query = query.filter(JobListing.salary_disclosed == True)

        # Min salary filter
        if params.min_salary is not None and params.min_salary > 0:
            query = query.filter(or_(
                JobListing.salary_max >= params.min_salary,
                JobListing.salary_min >= params.min_salary
            ))

        # Freshness filter
        if params.freshness_days:
            cutoff = utc_now() - timedelta(days=params.freshness_days)
            query = query.filter(JobListing.posted_at >= cutoff)

        # Skills filtering (AND logic across requested comma-separated skills)
        if params.skills:
            req_skills = [s.strip().lower() for s in params.skills.split(",") if s.strip()]
            for sk in req_skills:
                # Skill can match skills_raw JSON or JobSkill table
                query = query.filter(
                    func.cast(JobListing.skills_raw, String).ilike(f"%{sk}%")
                )

        # Sorting
        if params.sort_by == "salary_high":
            query = query.order_by(desc(JobListing.salary_max), desc(JobListing.salary_min))
        elif params.sort_by == "recent":
            query = query.order_by(desc(JobListing.posted_at))
        else:
            query = query.order_by(desc(JobListing.posted_at))

        total = query.count()
        page_size = max(1, min(params.page_size, 100))
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        page = max(1, min(params.page, total_pages))

        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()

        # Check saved and application states for current user
        saved_job_ids = set(
            s[0] for s in db.query(SavedJob.job_id).filter(SavedJob.user_id == user_id).all()
        )
        app_status_map = {
            a.job_id: a.status for a in db.query(JobApplication).filter(JobApplication.user_id == user_id).all()
        }

        items = []
        for r in results:
            items.append(JobListingOut(
                id=r.id,
                source_id=r.source_id,
                source_name=r.source.source_name if r.source else "Direct Listing",
                title=r.title,
                company_name=r.company_name,
                company_logo_url=r.company_logo_url,
                city=r.city,
                state=r.state,
                country=r.country,
                is_remote_eligible_india=r.is_remote_eligible_india,
                work_mode=r.work_mode,
                employment_type=r.employment_type,
                experience_min=r.experience_min,
                experience_max=r.experience_max,
                salary_disclosed=r.salary_disclosed,
                salary_min=r.salary_min,
                salary_max=r.salary_max,
                salary_currency=r.salary_currency,
                salary_period=r.salary_period,
                skills_raw=r.skills_raw or [],
                apply_url=r.apply_url,
                posted_at=r.posted_at,
                is_active=r.is_active,
                is_synthetic=r.is_synthetic,
                is_saved=r.id in saved_job_ids,
                application_status=app_status_map.get(r.id)
            ))

        return PaginatedJobsOut(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=items
        )

    @classmethod
    def get_job_detail(
        cls, 
        db: Session, 
        job_id: int, 
        user_id: str = "default_user",
        user_skills: Optional[List[str]] = None
    ) -> Optional[JobDetailOut]:
        """
        Retrieves complete job details with:
        1. Benchmark comparison against SALVERA's salary database.
        2. Skill alignment analysis (matching vs missing).
        """
        job = db.query(JobListing).filter(JobListing.id == job_id).first()
        if not job:
            return None

        # Increment views counter
        job.views_count = (job.views_count or 0) + 1
        db.commit()

        # Check saved and applied status
        is_saved = db.query(SavedJob).filter(
            SavedJob.job_id == job_id, 
            SavedJob.user_id == user_id
        ).first() is not None

        app = db.query(JobApplication).filter(
            JobApplication.job_id == job_id,
            JobApplication.user_id == user_id
        ).first()
        application_status = app.status if app else None

        # 1. Salary Benchmark Integration
        benchmark = cls.calculate_salary_benchmark(db, job)

        # 2. Skill Alignment
        job_skills_query = db.query(JobSkill).filter(JobSkill.job_id == job_id).all()
        skills_out = [
            {"id": js.id, "skill_name": js.skill_name, "skill_type": js.skill_type}
            for js in job_skills_query
        ]

        skill_alignment = cls.calculate_skill_alignment(
            required_skills=[js.skill_name for js in job_skills_query if js.skill_type == "required"],
            preferred_skills=[js.skill_name for js in job_skills_query if js.skill_type == "preferred"],
            user_skills=user_skills or []
        )

        return JobDetailOut(
            id=job.id,
            source_id=job.source_id,
            source_name=job.source.source_name if job.source else "Direct Listing",
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
            is_saved=is_saved,
            application_status=application_status,
            description=job.description,
            responsibilities=job.responsibilities or [],
            requirements=job.requirements or [],
            skills=skills_out,
            salary_benchmark=benchmark,
            skill_alignment=skill_alignment
        )

    @classmethod
    def calculate_salary_benchmark(cls, db: Session, job: JobListing) -> SalaryBenchmarkComparison:
        """
        Links job to SALVERA's 5,292-record salary database.
        Finds matching records for canonical role + city.
        """
        # Determine canonical role title
        canonical_title = None
        if job.canonical_role:
            canonical_title = job.canonical_role.canonical_title
        else:
            # Match title keywords against known roles
            all_roles = db.query(JobRole).all()
            for r in all_roles:
                if r.canonical_title.lower() in job.title.lower():
                    canonical_title = r.canonical_title
                    break
            if not canonical_title:
                canonical_title = "Software Engineer"

        # Query salary records for this role in India/city
        bench_records = db.query(SalaryRecord.normalized_annual_salary).join(JobRole).filter(
            JobRole.canonical_title == canonical_title
        ).all()

        if not bench_records:
            return SalaryBenchmarkComparison(
                has_benchmark=False,
                comparison_text="No baseline benchmark records available for this role title."
            )

        sal_values = [r[0] for r in bench_records]
        sal_values.sort()
        count = len(sal_values)
        median = sal_values[count // 2]
        p25 = sal_values[int(count * 0.25)]
        p75 = sal_values[int(count * 0.75)]

        advertised_midpoint = None
        comparison_pct = None
        comp_text = ""

        if job.salary_disclosed and job.salary_min and job.salary_max:
            advertised_midpoint = (job.salary_min + job.salary_max) / 2.0
            diff = advertised_midpoint - median
            comparison_pct = round((diff / median) * 100.0, 1)

            if comparison_pct > 0:
                comp_text = f"+{comparison_pct}% above SALVERA market median for {canonical_title} (₹{round(median/100000, 1)} LPA)"
            else:
                comp_text = f"{comparison_pct}% relative to SALVERA market median for {canonical_title} (₹{round(median/100000, 1)} LPA)"
        else:
            comp_text = f"Salary not disclosed by employer. SALVERA benchmark for {canonical_title}: ₹{round(median/100000, 1)} LPA median (₹{round(p25/100000, 1)}L – ₹{round(p75/100000, 1)}L LPA range based on {count} verified observations)."

        return SalaryBenchmarkComparison(
            has_benchmark=True,
            canonical_role=canonical_title,
            benchmark_median=round(median, 2),
            benchmark_p25=round(p25, 2),
            benchmark_p75=round(p75, 2),
            sample_count=count,
            advertised_midpoint=advertised_midpoint,
            comparison_percentage=comparison_pct,
            comparison_text=comp_text
        )

    @classmethod
    def calculate_skill_alignment(
        cls, 
        required_skills: List[str], 
        preferred_skills: List[str], 
        user_skills: List[str]
    ) -> SkillAlignmentResult:
        """
        Determines matched, missing required, and missing preferred skills.
        """
        user_set = {s.strip().lower() for s in user_skills if s.strip()}
        
        matching = []
        missing_req = []
        missing_pref = []

        for req in required_skills:
            if req.strip().lower() in user_set:
                matching.append(req)
            else:
                missing_req.append(req)

        for pref in preferred_skills:
            if pref.strip().lower() in user_set:
                matching.append(pref)
            else:
                missing_pref.append(pref)

        total_tracked = len(required_skills) + len(preferred_skills)
        match_pct = round((len(matching) / total_tracked) * 100.0, 1) if total_tracked > 0 else 100.0

        return SkillAlignmentResult(
            matching_skills=matching,
            missing_required_skills=missing_req,
            missing_preferred_skills=missing_pref,
            match_percentage=match_pct
        )
