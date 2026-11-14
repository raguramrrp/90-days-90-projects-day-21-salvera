from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.session import init_db, SessionLocal
from backend.app.database.models import SalaryRecord
from backend.scripts.seed_db import seed_database
from backend.app.api import (
    overview, salaries, skills, roles, locations,
    offers, predictions, career, market_watch, datasets,
    jobs, career_profile, job_activity
)
from backend.app.jobs.services.job_service import JobService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema on startup
    init_db()
    # Seed initial job corpus if empty
    with SessionLocal() as db:
        JobService.seed_initial_jobs_if_empty(db)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SALVERA — Technology Salary & Career Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(overview.router, prefix=settings.API_V1_STR)
app.include_router(salaries.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(roles.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(career.router, prefix=settings.API_V1_STR)
app.include_router(market_watch.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(career_profile.router, prefix=settings.API_V1_STR)
app.include_router(job_activity.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "title": settings.PROJECT_TITLE,
        "tagline": settings.TAGLINE,
        "status": "online",
        "docs_url": "/docs",
        "synthetic_disclosure": "DEMO DATA — SYNTHETIC EXAMPLE, NOT OBSERVED MARKET SALARY."
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "SALVERA Backend API"}
