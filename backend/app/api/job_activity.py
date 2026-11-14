"""
User Job Activity, Saved Jobs, Kanban Tracking, and Job Alerts API Router.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.schemas import (
    SavedJobOut, JobApplicationIn, JobApplicationOut, 
    JobApplicationStatusUpdate, JobAlertIn, JobAlertOut, JobNotificationOut
)
from backend.app.jobs.services.job_activity_service import JobActivityService

router = APIRouter(prefix="/my-activity", tags=["My Activity"])

# Saved Jobs
@router.get("/saved", response_model=List[SavedJobOut])
def get_saved_jobs(db: Session = Depends(get_db)):
    return JobActivityService.get_saved_jobs(db, user_id="default_user")

# Applications Tracker
@router.get("/applications", response_model=List[JobApplicationOut])
def get_applications(db: Session = Depends(get_db)):
    return JobActivityService.get_user_applications(db, user_id="default_user")

@router.post("/applications", response_model=JobApplicationOut)
def track_application(payload: JobApplicationIn, db: Session = Depends(get_db)):
    return JobActivityService.track_application(db, payload, user_id="default_user")

@router.patch("/applications/{application_id}", response_model=JobApplicationOut)
def update_application_status(
    application_id: int, 
    payload: JobApplicationStatusUpdate, 
    db: Session = Depends(get_db)
):
    updated = JobActivityService.update_application_status(
        db, application_id=application_id, payload=payload, user_id="default_user"
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Application record not found")
    return updated

# Alerts & Notifications
@router.get("/alerts", response_model=List[JobAlertOut])
def get_job_alerts(db: Session = Depends(get_db)):
    return JobActivityService.get_job_alerts(db, user_id="default_user")

@router.post("/alerts", response_model=JobAlertOut)
def create_job_alert(payload: JobAlertIn, db: Session = Depends(get_db)):
    return JobActivityService.create_job_alert(db, payload, user_id="default_user")

@router.get("/notifications", response_model=List[JobNotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    return JobActivityService.get_notifications(db, user_id="default_user")
