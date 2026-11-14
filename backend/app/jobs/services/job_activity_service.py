"""
User Activity, Application Tracking (Kanban), and Job Alert Service.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.models import (
    SavedJob, JobApplication, JobAlert, JobNotification, JobListing, UserJobInteraction
)
from backend.app.schemas.schemas import (
    SavedJobOut, JobApplicationIn, JobApplicationOut, 
    JobApplicationStatusUpdate, JobAlertIn, JobAlertOut, JobNotificationOut, JobListingOut
)

def utc_now():
    return datetime.now(timezone.utc)

class JobActivityService:

    # --- Saved Jobs ---
    @classmethod
    def toggle_save_job(cls, db: Session, job_id: int, user_id: str = "default_user", notes: Optional[str] = None) -> Dict[str, Any]:
        existing = db.query(SavedJob).filter(
            SavedJob.job_id == job_id,
            SavedJob.user_id == user_id
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            # Log interaction
            db.add(UserJobInteraction(user_id=user_id, job_id=job_id, interaction_type="unsave"))
            db.commit()
            return {"job_id": job_id, "is_saved": False, "message": "Job removed from saved items"}
        else:
            new_save = SavedJob(job_id=job_id, user_id=user_id, notes=notes)
            db.add(new_save)
            db.add(UserJobInteraction(user_id=user_id, job_id=job_id, interaction_type="save"))
            db.commit()
            return {"job_id": job_id, "is_saved": True, "message": "Job bookmarked successfully"}

    @classmethod
    def get_saved_jobs(cls, db: Session, user_id: str = "default_user") -> List[SavedJobOut]:
        saved_entries = db.query(SavedJob).filter(
            SavedJob.user_id == user_id
        ).order_by(desc(SavedJob.created_at)).all()

        results = []
        for entry in saved_entries:
            job = entry.listing
            if not job:
                continue

            app = db.query(JobApplication).filter(
                JobApplication.job_id == job.id,
                JobApplication.user_id == user_id
            ).first()

            job_out = JobListingOut(
                id=job.id,
                source_id=job.source_id,
                source_name=job.source.source_name if job.source else "Direct",
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
                is_saved=True,
                application_status=app.status if app else None
            )

            results.append(SavedJobOut(
                id=entry.id,
                job_id=entry.job_id,
                created_at=entry.created_at,
                notes=entry.notes,
                job=job_out
            ))

        return results

    # --- Application Tracker & Kanban ---
    @classmethod
    def track_application(cls, db: Session, payload: JobApplicationIn, user_id: str = "default_user") -> JobApplicationOut:
        existing = db.query(JobApplication).filter(
            JobApplication.job_id == payload.job_id,
            JobApplication.user_id == user_id
        ).first()

        if existing:
            existing.status = payload.status
            existing.company_name = payload.company_name
            existing.job_title = payload.job_title
            if payload.applied_date:
                existing.applied_date = payload.applied_date
            if payload.interview_date:
                existing.interview_date = payload.interview_date
            if payload.offered_salary:
                existing.offered_salary = payload.offered_salary
            if payload.notes:
                existing.notes = payload.notes
            existing.updated_at = utc_now()
            db.commit()
            db.refresh(existing)
            app_obj = existing
        else:
            app_obj = JobApplication(
                user_id=user_id,
                job_id=payload.job_id,
                status=payload.status,
                company_name=payload.company_name,
                job_title=payload.job_title,
                applied_date=payload.applied_date or utc_now(),
                interview_date=payload.interview_date,
                offered_salary=payload.offered_salary,
                notes=payload.notes
            )
            db.add(app_obj)
            db.add(UserJobInteraction(user_id=user_id, job_id=payload.job_id, interaction_type="apply"))
            db.commit()
            db.refresh(app_obj)

        job_listing = app_obj.listing
        job_out = None
        if job_listing:
            job_out = JobListingOut(
                id=job_listing.id,
                title=job_listing.title,
                company_name=job_listing.company_name,
                city=job_listing.city,
                country=job_listing.country,
                is_remote_eligible_india=job_listing.is_remote_eligible_india,
                work_mode=job_listing.work_mode,
                employment_type=job_listing.employment_type,
                experience_min=job_listing.experience_min,
                experience_max=job_listing.experience_max,
                salary_disclosed=job_listing.salary_disclosed,
                salary_min=job_listing.salary_min,
                salary_max=job_listing.salary_max,
                apply_url=job_listing.apply_url,
                posted_at=job_listing.posted_at,
                is_active=job_listing.is_active,
                is_synthetic=job_listing.is_synthetic,
                is_saved=True,
                application_status=app_obj.status
            )

        return JobApplicationOut(
            id=app_obj.id,
            job_id=app_obj.job_id,
            status=app_obj.status,
            company_name=app_obj.company_name,
            job_title=app_obj.job_title,
            applied_date=app_obj.applied_date,
            interview_date=app_obj.interview_date,
            offered_salary=app_obj.offered_salary,
            notes=app_obj.notes,
            updated_at=app_obj.updated_at,
            job=job_out
        )

    @classmethod
    def update_application_status(
        cls, 
        db: Session, 
        application_id: int, 
        payload: JobApplicationStatusUpdate, 
        user_id: str = "default_user"
    ) -> Optional[JobApplicationOut]:
        app = db.query(JobApplication).filter(
            JobApplication.id == application_id,
            JobApplication.user_id == user_id
        ).first()

        if not app:
            return None

        app.status = payload.status
        if payload.interview_date is not None:
            app.interview_date = payload.interview_date
        if payload.offered_salary is not None:
            app.offered_salary = payload.offered_salary
        if payload.notes is not None:
            app.notes = payload.notes
        app.updated_at = utc_now()
        db.commit()
        db.refresh(app)

        return JobApplicationOut(
            id=app.id,
            job_id=app.job_id,
            status=app.status,
            company_name=app.company_name,
            job_title=app.job_title,
            applied_date=app.applied_date,
            interview_date=app.interview_date,
            offered_salary=app.offered_salary,
            notes=app.notes,
            updated_at=app.updated_at
        )

    @classmethod
    def get_user_applications(cls, db: Session, user_id: str = "default_user") -> List[JobApplicationOut]:
        apps = db.query(JobApplication).filter(
            JobApplication.user_id == user_id
        ).order_by(desc(JobApplication.updated_at)).all()

        results = []
        for a in apps:
            job = a.listing
            job_out = None
            if job:
                job_out = JobListingOut(
                    id=job.id,
                    title=job.title,
                    company_name=job.company_name,
                    city=job.city,
                    country=job.country,
                    work_mode=job.work_mode,
                    employment_type=job.employment_type,
                    experience_min=job.experience_min,
                    experience_max=job.experience_max,
                    salary_disclosed=job.salary_disclosed,
                    salary_min=job.salary_min,
                    salary_max=job.salary_max,
                    apply_url=job.apply_url,
                    posted_at=job.posted_at,
                    is_active=job.is_active,
                    is_synthetic=job.is_synthetic,
                    application_status=a.status
                )

            results.append(JobApplicationOut(
                id=a.id,
                job_id=a.job_id,
                status=a.status,
                company_name=a.company_name,
                job_title=a.job_title,
                applied_date=a.applied_date,
                interview_date=a.interview_date,
                offered_salary=a.offered_salary,
                notes=a.notes,
                updated_at=a.updated_at,
                job=job_out
            ))

        return results

    # --- Job Alerts ---
    @classmethod
    def create_job_alert(cls, db: Session, payload: JobAlertIn, user_id: str = "default_user") -> JobAlertOut:
        alert = JobAlert(
            user_id=user_id,
            alert_title=payload.alert_title,
            role_keywords=payload.role_keywords,
            skills=payload.skills,
            city=payload.city,
            work_mode=payload.work_mode,
            min_salary=payload.min_salary,
            frequency=payload.frequency,
            is_active=True
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Generate an initial notification welcoming the alert
        notif = JobNotification(
            user_id=user_id,
            alert_id=alert.id,
            title=f"Alert Active: {alert.alert_title}",
            message=f"SALVERA is monitoring new Indian tech openings matching {alert.role_keywords or 'your preferences'} in {alert.city or 'India'}."
        )
        db.add(notif)
        db.commit()

        return JobAlertOut(
            id=alert.id,
            alert_title=alert.alert_title,
            role_keywords=alert.role_keywords,
            skills=alert.skills or [],
            city=alert.city,
            work_mode=alert.work_mode,
            min_salary=alert.min_salary,
            frequency=alert.frequency,
            is_active=alert.is_active,
            created_at=alert.created_at
        )

    @classmethod
    def get_job_alerts(cls, db: Session, user_id: str = "default_user") -> List[JobAlertOut]:
        alerts = db.query(JobAlert).filter(
            JobAlert.user_id == user_id
        ).order_by(desc(JobAlert.created_at)).all()

        return [
            JobAlertOut(
                id=a.id,
                alert_title=a.alert_title,
                role_keywords=a.role_keywords,
                skills=a.skills or [],
                city=a.city,
                work_mode=a.work_mode,
                min_salary=a.min_salary,
                frequency=a.frequency,
                is_active=a.is_active,
                created_at=a.created_at
            ) for a in alerts
        ]

    @classmethod
    def get_notifications(cls, db: Session, user_id: str = "default_user") -> List[JobNotificationOut]:
        notifs = db.query(JobNotification).filter(
            JobNotification.user_id == user_id
        ).order_by(desc(JobNotification.created_at)).all()

        return [
            JobNotificationOut(
                id=n.id,
                title=n.title,
                message=n.message,
                is_read=n.is_read,
                created_at=n.created_at,
                job_id=n.job_id,
                alert_id=n.alert_id
            ) for n in notifs
        ]
