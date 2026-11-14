import sys
from pathlib import Path
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.session import SessionLocal, init_db
from backend.app.database.models import JobListing, JobSource, SavedJob, JobApplication, JobAlert
from backend.app.jobs.providers.job_provider_base import JobProviderBase
from backend.app.jobs.providers.curated_india_provider import CuratedIndiaProvider
from backend.app.jobs.services.job_service import JobService
from backend.app.jobs.services.job_recommendation_service import JobRecommendationService
from backend.app.jobs.services.job_activity_service import JobActivityService
from backend.app.schemas.schemas import JobFilterParams, JobApplicationIn, JobApplicationStatusUpdate, JobAlertIn

@pytest.fixture(scope="module")
def db():
    init_db()
    session = SessionLocal()
    # Ensure jobs are seeded
    JobService.seed_initial_jobs_if_empty(session)
    yield session
    session.close()

def test_provider_india_validation():
    class DummyProvider(JobProviderBase):
        def fetch_jobs(self, limit=10, query=None, city=None):
            return []

    provider = DummyProvider("Dummy", "test")

    # Valid Indian jobs
    assert provider.validate_india_only({"country": "India", "city": "Chennai", "work_mode": "On-site"})
    assert provider.validate_india_only({"country": "India", "city": "Bengaluru", "work_mode": "Hybrid"})
    assert provider.validate_india_only({"country": "India", "city": "Bengaluru", "work_mode": "Remote", "is_remote_eligible_india": True})

    # Invalid non-India jobs
    assert not provider.validate_india_only({"country": "United States", "city": "San Francisco"})
    assert not provider.validate_india_only({"country": "United Kingdom", "city": "London"})
    # Worldwide remote without India eligibility verification
    assert not provider.validate_india_only({"country": "Germany", "work_mode": "Remote", "is_remote_eligible_india": False})

def test_curated_provider_output():
    provider = CuratedIndiaProvider()
    jobs = provider.fetch_jobs(limit=25)
    assert len(jobs) == 25
    for j in jobs:
        assert j["country"] == "India"
        assert j["is_synthetic"] is True
        assert j["city"] in [
            "Chennai", "Bengaluru", "Hyderabad", "Pune", "Mumbai", 
            "Delhi NCR", "Coimbatore", "Tirunelveli", "Madurai", "Kochi"
        ]

def test_job_search_filters(db):
    # Test searching by city
    chennai_jobs = JobService.search_jobs(db, JobFilterParams(city="Chennai"))
    assert chennai_jobs.total > 0
    for item in chennai_jobs.items:
        assert item.city.lower() == "chennai"
        assert item.country == "India"

    # Test searching by fresher experience
    fresher_jobs = JobService.search_jobs(db, JobFilterParams(experience_level="fresher"))
    assert fresher_jobs.total > 0
    for item in fresher_jobs.items:
        assert item.experience_min <= 1.0

    # Test searching by role
    analyst_jobs = JobService.search_jobs(db, JobFilterParams(role="Data Analyst"))
    assert analyst_jobs.total > 0
    for item in analyst_jobs.items:
        assert "analyst" in item.title.lower()

def test_job_detail_benchmark_linkage(db):
    sample = db.query(JobListing).first()
    assert sample is not None

    detail = JobService.get_job_detail(db, sample.id, user_id="test_user", user_skills=["Python", "SQL"])
    assert detail is not None
    assert detail.id == sample.id
    assert detail.country == "India"

    # Verify benchmark comparison is populated
    assert detail.salary_benchmark is not None
    assert detail.salary_benchmark.has_benchmark is True
    assert detail.salary_benchmark.benchmark_median > 0
    assert detail.salary_benchmark.sample_count > 0
    assert len(detail.salary_benchmark.comparison_text) > 0

def test_skill_alignment():
    req = ["Python", "SQL", "Power BI"]
    pref = ["Pandas", "Docker"]
    user_skills = ["python", "sql", "git"]

    res = JobService.calculate_skill_alignment(req, pref, user_skills)
    assert "Python" in res.matching_skills
    assert "SQL" in res.matching_skills
    assert "Power BI" in res.missing_required_skills
    assert "Pandas" in res.missing_preferred_skills
    assert res.match_percentage == 40.0

def test_job_recommendation_scoring(db):
    recs = JobRecommendationService.get_personalized_recommendations(db, user_id="default_user", limit=5)
    assert len(recs) == 5
    for r in recs:
        assert r.match_score is not None
        assert 0.0 <= r.match_score <= 100.0
        assert len(r.match_reasons) > 0
        assert r.country == "India"

def test_saved_jobs_and_applications(db):
    sample = db.query(JobListing).first()
    user_id = "test_user_activity"

    # 1. Bookmark job
    save_res = JobActivityService.toggle_save_job(db, sample.id, user_id=user_id)
    assert save_res["is_saved"] is True

    saved_list = JobActivityService.get_saved_jobs(db, user_id=user_id)
    assert len(saved_list) == 1
    assert saved_list[0].job_id == sample.id

    # 2. Track application
    app_in = JobApplicationIn(
        job_id=sample.id,
        status="applied",
        company_name=sample.company_name,
        job_title=sample.title,
        notes="Applied via official careers portal"
    )
    app_out = JobActivityService.track_application(db, app_in, user_id=user_id)
    assert app_out.status == "applied"

    # 3. Update status to interviewing
    update_res = JobActivityService.update_application_status(
        db, application_id=app_out.id,
        payload=JobApplicationStatusUpdate(status="interviewing", notes="Technical round scheduled"),
        user_id=user_id
    )
    assert update_res.status == "interviewing"
    assert update_res.notes == "Technical round scheduled"

    # 4. Clean up toggle save
    unsave_res = JobActivityService.toggle_save_job(db, sample.id, user_id=user_id)
    assert unsave_res["is_saved"] is False

def test_job_alerts(db):
    user_id = "test_user_alerts"
    alert_in = JobAlertIn(
        alert_title="Chennai Data Roles",
        role_keywords="Data Analyst",
        skills=["Python", "SQL"],
        city="Chennai",
        min_salary=500000.0
    )
    alert = JobActivityService.create_job_alert(db, alert_in, user_id=user_id)
    assert alert.id is not None
    assert alert.alert_title == "Chennai Data Roles"

    alerts = JobActivityService.get_job_alerts(db, user_id=user_id)
    assert len(alerts) >= 1

    notifs = JobActivityService.get_notifications(db, user_id=user_id)
    assert len(notifs) >= 1
    assert "Chennai Data Roles" in notifs[0].title
