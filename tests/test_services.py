import sys
from pathlib import Path
import pytest

# Ensure root in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.session import SessionLocal, init_db
from backend.app.database.models import SalaryRecord, JobRole, Location, Skill
from backend.app.services.normalization_service import NormalizationService
from backend.app.services.salary_service import SalaryService
from backend.app.services.skill_service import SkillService
from backend.app.services.role_service import RoleService
from backend.app.services.location_service import LocationService
from backend.app.services.offer_service import OfferService
from backend.app.services.career_service import CareerService
from backend.app.services.dataset_service import DatasetService
from backend.app.services.pdf_export_service import PDFExportService
from backend.app.ml.predictor import SalaryPredictor
from backend.app.schemas.schemas import SalaryFilterParams, JobOfferIn, CareerPlanCreate

@pytest.fixture(scope="module")
def db():
    init_db()
    session = SessionLocal()
    yield session
    session.close()

def test_normalization_direct_inr():
    res = NormalizationService.normalize_salary(1200000.0, "INR", "annual")
    assert res["normalized_annual_salary"] == 1200000.0
    assert res["normalized_currency"] == "INR"
    assert not res["is_estimated_conversion"]

def test_normalization_monthly_inr():
    res = NormalizationService.normalize_salary(100000.0, "INR", "monthly")
    assert res["normalized_annual_salary"] == 1200000.0
    assert res["is_estimated_conversion"]

def test_normalization_usd():
    res = NormalizationService.normalize_salary(10000.0, "USD", "annual")
    assert res["normalized_annual_salary"] == 835000.0
    assert res["is_estimated_conversion"]

def test_inr_formatting():
    assert "12.00 LPA" in NormalizationService.format_inr(1200000.0, "lpa")
    assert "₹12,00,000" in NormalizationService.format_inr(1200000.0, "standard")

def test_salary_analytics_summary(db):
    params = SalaryFilterParams()
    data = SalaryService.get_paginated_records(db, params)
    assert data["total"] >= 2000
    assert len(data["records"]) <= 25
    analytics = data["analytics"]
    assert analytics.median > 0
    assert analytics.p25 <= analytics.median <= analytics.p75

def test_salary_distribution_bins(db):
    params = SalaryFilterParams()
    bins = SalaryService.get_distribution(db, params, bins=10)
    assert len(bins) > 0
    assert sum(b["count"] for b in bins) >= 2000

def test_salary_by_experience(db):
    params = SalaryFilterParams()
    exp_brackets = SalaryService.get_by_experience(db, params)
    assert len(exp_brackets) == 5
    # Experience progression check: 0-2 yrs median should be less than 8-12 yrs median
    entry_med = exp_brackets[0]["median_salary"]
    lead_med = exp_brackets[3]["median_salary"]
    assert lead_med > entry_med

def test_skill_rankings(db):
    ranks = SkillService.get_skill_rankings(db)
    assert len(ranks) > 0
    top_skill = ranks[0]
    assert top_skill.frequency_count > 50
    assert top_skill.median_salary > 0

def test_skill_comparison(db):
    profiles = [["Python"], ["Python", "SQL"]]
    comp = SkillService.compare_skill_profiles(db, profiles)
    assert len(comp) == 2
    assert comp[0].matching_records > 0
    assert comp[1].matching_records > 0

def test_role_service(db):
    roles = RoleService.get_all_roles(db)
    assert len(roles) >= 15
    role_id = roles[0].id
    detail = RoleService.get_role_detail(db, role_id)
    assert detail["title"] == roles[0].canonical_title
    assert "skills_distribution" in detail

def test_location_service(db):
    locs = LocationService.get_all_locations(db)
    assert len(locs) >= 7
    cities = [l.city for l in locs]
    assert "Bengaluru" in cities
    assert "Chennai" in cities

def test_offer_studio_financial_decomposition():
    offer_in = JobOfferIn(
        offer_name="Test Offer",
        company_name="Acme Corp",
        role_title="Backend Developer",
        location_name="Bengaluru",
        work_mode="Hybrid",
        fixed_salary=1500000.0,
        variable_salary=200000.0,
        joining_bonus=100000.0,
        annual_benefits=100000.0,
        monthly_deductions=25000.0,
        monthly_rent=20000.0,
        monthly_commute=3000.0,
        other_monthly_expenses=10000.0
    )
    fin = OfferService.calculate_financials(offer_in)
    assert fin.total_stated_ctc == 1900000.0
    assert fin.recurring_gross_annual == 1800000.0
    assert fin.monthly_gross_equivalent == 150000.0
    # Net take home: (1700000 - 300000) / 12 = 1400000 / 12 = 116666.67
    assert fin.estimated_monthly_take_home > 110000.0
    assert fin.total_monthly_expenses == 33000.0
    assert fin.estimated_monthly_disposable > 80000.0

def test_career_planner_gap_analysis(db):
    role = db.query(JobRole).first()
    plan_in = CareerPlanCreate(
        current_role="Junior Developer",
        target_role_id=role.id,
        target_date="2025-12-31",
        target_salary_expectation=1500000.0,
        current_skills=["Python", "SQL"]
    )
    plan_out = CareerService.create_plan_from_analysis(db, plan_in)
    assert plan_out.target_role_id == role.id
    assert len(plan_out.skills_gap) > 0
    # Python & SQL should be marked completed / current strength
    possessed = plan_out.skills_possessed
    assert "Python" in possessed or "SQL" in possessed

def test_ml_salary_predictor():
    predictor = SalaryPredictor.get_instance()
    assert predictor.is_ready()
    pred = predictor.predict(
        role_title="Data Scientist",
        experience_years=3.5,
        city="Bengaluru",
        skills=["Python", "SQL", "Machine Learning", "Scikit-learn"]
    )
    assert pred["predicted_annual_salary"] > 500000.0
    assert pred["lower_bound_salary"] < pred["predicted_annual_salary"] < pred["upper_bound_salary"]
    assert len(pred["feature_contributions"]) > 0

def test_dataset_quality_metrics(db):
    quality = DatasetService.get_quality_report(db)
    assert quality.total_records >= 2000
    assert quality.overall_quality_score > 80.0
    assert quality.currency_consistency_pct == 100.0

def test_pdf_generators():
    offer_data = {
        "comparison_name": "Test PDF Scenario",
        "offers": [
            {
                "offer_name": "Offer Alpha",
                "company_name": "Alpha Corp",
                "role_title": "Data Analyst",
                "location_name": "Chennai",
                "work_mode": "Hybrid",
                "fixed_salary": 900000.0,
                "variable_salary": 100000.0,
                "joining_bonus": 50000.0,
                "annual_benefits": 50000.0,
                "monthly_deductions": 12000.0,
                "financials": {
                    "total_stated_ctc": 1100000.0,
                    "recurring_gross_annual": 1050000.0,
                    "monthly_gross_equivalent": 87500.0,
                    "estimated_monthly_take_home": 71333.33,
                    "total_monthly_expenses": 25000.0,
                    "estimated_monthly_disposable": 46333.33
                }
            }
        ]
    }
    buf = PDFExportService.generate_offer_comparison_pdf(offer_data)
    pdf_bytes = buf.getvalue()
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")
