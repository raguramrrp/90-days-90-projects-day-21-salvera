from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- General & Overview ---
class OverviewSummary(BaseModel):
    total_records: int
    total_roles: int
    total_skills: int
    total_locations: int
    median_annual_salary: float
    mean_annual_salary: float
    salary_p25: float
    salary_p75: float
    latest_dataset_period: str
    is_synthetic: bool
    currency: str = "INR"

class SalaryDistributionBucket(BaseModel):
    bin_range: str
    min_salary: float
    max_salary: float
    count: int
    percentage: float

class ExperienceCompensationPoint(BaseModel):
    experience_bracket: str
    min_exp: float
    max_exp: float
    median_salary: float
    p25_salary: float
    p75_salary: float
    count: int

# --- Salary Records & Filtering ---
class SalaryFilterParams(BaseModel):
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    city: Optional[str] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    industry: Optional[str] = None
    employment_type: Optional[str] = None
    search: Optional[str] = None
    currency: Optional[str] = "INR"
    period: Optional[str] = "annual"
    page: int = 1
    page_size: int = 25
    sort_by: Optional[str] = "normalized_annual_salary"
    sort_order: Optional[str] = "desc"

class SalaryRecordOut(BaseModel):
    id: int
    job_title: str
    role_category: str
    city: str
    state: str
    country: str
    experience_years: float
    industry: str
    employment_type: str
    skills: List[str]
    original_salary: float
    original_currency: str
    compensation_period: str
    normalized_annual_salary: float
    normalized_currency: str
    survey_year: int
    is_synthetic: bool

    model_config = ConfigDict(from_attributes=True)

class SalaryAnalyticsSummary(BaseModel):
    record_count: int
    median: float
    mean: float
    p25: float
    p75: float
    min_val: float
    max_val: float
    currency: str = "INR"
    sample_reliability_warning: Optional[str] = None

class SalaryPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    records: List[SalaryRecordOut]
    analytics: SalaryAnalyticsSummary

# --- Skills ---
class SkillRankItem(BaseModel):
    skill_name: str
    category: str
    frequency_count: int
    percentage: float
    median_salary: float
    p25_salary: float
    p75_salary: float

class SkillComparisonProfile(BaseModel):
    profile_label: str
    skills_required: List[str]
    matching_records: int
    median_salary: float
    p25_salary: float
    p75_salary: float
    avg_experience: float
    common_roles: List[str]
    top_locations: List[str]

class SkillCombinationItem(BaseModel):
    skill_a: str
    skill_b: str
    co_occurrence_count: int
    median_salary: float
    relative_lift: float

# --- Roles ---
class RoleOverviewOut(BaseModel):
    id: int
    canonical_title: str
    category: str
    description: Optional[str] = None
    record_count: int
    median_salary: float
    p25_salary: float
    p75_salary: float
    min_salary: float
    max_salary: float
    common_skills: List[str]
    typical_experience: str
    top_locations: List[str]

class RoleComparisonItem(BaseModel):
    id: int
    title: str
    category: str
    record_count: int
    median_salary: float
    p25_salary: float
    p75_salary: float
    min_exp: float
    max_exp: float
    key_skills: List[Dict[str, Any]]
    top_cities: List[str]

# --- Locations ---
class LocationOverviewOut(BaseModel):
    id: int
    city: str
    state: str
    tier: str
    record_count: int
    median_salary: float
    p25_salary: float
    p75_salary: float
    top_roles: List[str]
    top_skills: List[str]
    col_index: float

# --- Offer Studio ---
class JobOfferIn(BaseModel):
    offer_name: str
    company_name: str
    role_title: str
    location_name: str = "Bengaluru"
    work_mode: str = "Hybrid"
    fixed_salary: float = Field(..., description="Annual base pay in INR")
    variable_salary: float = Field(0.0, description="Annual target bonus in INR")
    joining_bonus: float = Field(0.0, description="One-time cash bonus in INR")
    annual_benefits: float = Field(0.0, description="Annual perks value in INR")
    monthly_deductions: float = Field(0.0, description="Taxes and PF deducted monthly in INR")
    monthly_rent: float = Field(0.0, description="Monthly rent in INR")
    monthly_commute: float = Field(0.0, description="Monthly commute in INR")
    other_monthly_expenses: float = Field(0.0, description="Other monthly expenses in INR")

class FinancialDecomposition(BaseModel):
    fixed_annual: float
    variable_annual: float
    one_time_joining: float
    annual_recurring_benefits: float
    total_stated_ctc: float
    recurring_gross_annual: float
    monthly_gross_equivalent: float
    estimated_annual_deductions: float
    estimated_monthly_take_home: float
    total_monthly_expenses: float
    estimated_monthly_disposable: float

class JobOfferOut(JobOfferIn):
    id: int
    comparison_id: int
    financials: FinancialDecomposition
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OfferComparisonCreate(BaseModel):
    comparison_name: str = "Tech Offer Comparison 2025"
    notes: Optional[str] = None
    offers: List[JobOfferIn]

class OfferComparisonOut(BaseModel):
    id: int
    comparison_name: str
    notes: Optional[str] = None
    created_at: datetime
    offers: List[JobOfferOut]

# --- Salary Estimator / ML ---
class SalaryPredictionRequest(BaseModel):
    role_title: str
    experience_years: float = Field(..., ge=0.0, le=40.0)
    city: str
    skills: List[str]
    industry: Optional[str] = "Information Technology"
    employment_type: Optional[str] = "Full-time"

class SalaryPredictionResponse(BaseModel):
    predicted_annual_salary: float
    predicted_monthly_salary: float
    lower_bound_salary: float
    upper_bound_salary: float
    confidence_interval_percentage: int = 90
    currency: str = "INR"
    comparable_records_count: int
    model_version: str
    algorithm: str
    feature_contributions: List[Dict[str, Any]]
    disclaimer: str = (
        "Statistical estimate produced by machine learning model trained on available dataset. "
        "Actual market compensation may vary by interview performance, company scale, and negotiation."
    )

class ModelEvaluationOut(BaseModel):
    model_name: str
    algorithm: str
    version: str
    train_samples: int
    test_samples: int
    mae: float
    rmse: float
    r2_score: float
    median_abs_error: float
    created_at: datetime
    is_active: bool

# --- Career Planner ---
class CareerPlanSkillIn(BaseModel):
    skill_name: str
    category: str = "core_gap"
    priority: str = "High"
    completion_status: str = "Planned"
    order_index: int = 0
    target_date: Optional[str] = None
    notes: Optional[str] = None

class CareerPlanSkillOut(CareerPlanSkillIn):
    id: int
    career_plan_id: int

    model_config = ConfigDict(from_attributes=True)

class CareerPlanCreate(BaseModel):
    current_role: str
    target_role_id: int
    target_date: Optional[str] = None
    target_salary_expectation: Optional[float] = None
    current_skills: List[str] = []

class CareerPlanOut(BaseModel):
    id: int
    current_role: str
    target_role_id: int
    target_role_title: str
    target_date: Optional[str]
    target_salary_expectation: Optional[float]
    skills_possessed: List[str]
    skills_gap: List[CareerPlanSkillOut]
    completion_percentage: float
    created_at: datetime
    updated_at: datetime

# --- Market Watch ---
class WatchlistCreate(BaseModel):
    item_type: str  # role, skill, location, industry
    item_name: str
    filter_criteria: Optional[Dict[str, Any]] = None

class WatchlistOut(BaseModel):
    id: int
    item_type: str
    item_name: str
    baseline_median_salary: Optional[float]
    baseline_sample_count: Optional[int]
    current_median_salary: Optional[float]
    current_sample_count: Optional[int]
    salary_change_pct: Optional[float]
    created_at: datetime

# --- Data & Quality ---
class DatasetQualityMetric(BaseModel):
    total_records: int
    missing_fields_pct: float
    duplicate_rows_count: int
    outlier_salary_count: int
    valid_salary_pct: float
    currency_consistency_pct: float
    provenance_status: str
    overall_quality_score: float

class DatasetOut(BaseModel):
    id: int
    dataset_name: str
    source_name: str
    licence: str
    collection_period: str
    record_count: int
    is_synthetic: bool
    status: str
    quality_score: float
    imported_at: datetime


# =====================================================================
# INDIA-FIRST JOB DISCOVERY & CAREER SCHEMAS
# =====================================================================

class JobSkillOut(BaseModel):
    id: Optional[int] = None
    skill_name: str
    skill_type: str = "required"  # required or preferred

class JobListingOut(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: Optional[str] = "Curated Indian Tech Feed"
    title: str
    company_name: str
    company_logo_url: Optional[str] = None
    city: str
    state: Optional[str] = None
    country: str = "India"
    is_remote_eligible_india: bool = False
    work_mode: str
    employment_type: str
    experience_min: float
    experience_max: float
    salary_disclosed: bool
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "INR"
    salary_period: str = "annual"
    skills_raw: List[str] = []
    apply_url: str
    posted_at: datetime
    is_active: bool
    is_synthetic: bool = False
    is_saved: bool = False
    application_status: Optional[str] = None
    match_score: Optional[float] = None
    match_reasons: List[str] = []

class SalaryBenchmarkComparison(BaseModel):
    has_benchmark: bool
    canonical_role: Optional[str] = None
    benchmark_median: Optional[float] = None
    benchmark_p25: Optional[float] = None
    benchmark_p75: Optional[float] = None
    sample_count: int = 0
    advertised_midpoint: Optional[float] = None
    comparison_percentage: Optional[float] = None
    comparison_text: str = ""

class SkillAlignmentResult(BaseModel):
    matching_skills: List[str] = []
    missing_required_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    match_percentage: float = 0.0

class JobDetailOut(JobListingOut):
    description: str
    responsibilities: List[str] = []
    requirements: List[str] = []
    skills: List[JobSkillOut] = []
    salary_benchmark: Optional[SalaryBenchmarkComparison] = None
    skill_alignment: Optional[SkillAlignmentResult] = None

class JobFilterParams(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None  # fresher, junior, mid, senior, lead
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    salary_disclosed_only: Optional[bool] = False
    min_salary: Optional[float] = None
    freshness_days: Optional[int] = None
    page: int = 1
    page_size: int = 20
    sort_by: str = "recent"  # recent, relevance, salary_high

class PaginatedJobsOut(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[JobListingOut]

class CareerProfileIn(BaseModel):
    profile_title: str = "Technology Professional"
    candidate_type: str = "Student"  # Student, Fresher, Working Professional, Career Switcher
    target_roles: List[str] = []
    primary_skills: List[str] = []
    secondary_skills: List[str] = []
    experience_years: float = 0.0
    current_city: str = "Chennai"
    preferred_cities: List[str] = []
    preferred_work_modes: List[str] = []
    preferred_employment_types: List[str] = []
    min_expected_salary: float = 0.0
    education_degree: Optional[str] = "B.Tech Artificial Intelligence & Data Science"
    graduation_year: Optional[int] = 2025

class CareerProfileOut(CareerProfileIn):
    id: int
    user_id: str
    updated_at: datetime

class SavedJobIn(BaseModel):
    job_id: int
    notes: Optional[str] = None

class SavedJobOut(BaseModel):
    id: int
    job_id: int
    created_at: datetime
    notes: Optional[str] = None
    job: JobListingOut

class JobApplicationIn(BaseModel):
    job_id: int
    status: str = "applied"  # saved, applied, interviewing, offered, rejected, archived
    company_name: str
    job_title: str
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offered_salary: Optional[float] = None
    notes: Optional[str] = None

class JobApplicationStatusUpdate(BaseModel):
    status: str
    interview_date: Optional[datetime] = None
    offered_salary: Optional[float] = None
    notes: Optional[str] = None

class JobApplicationOut(BaseModel):
    id: int
    job_id: int
    status: str
    company_name: str
    job_title: str
    applied_date: datetime
    interview_date: Optional[datetime] = None
    offered_salary: Optional[float] = None
    notes: Optional[str] = None
    updated_at: datetime
    job: Optional[JobListingOut] = None

class JobAlertIn(BaseModel):
    alert_title: str
    role_keywords: Optional[str] = None
    skills: List[str] = []
    city: Optional[str] = None
    work_mode: Optional[str] = None
    min_salary: Optional[float] = None
    frequency: str = "instant"

class JobAlertOut(BaseModel):
    id: int
    alert_title: str
    role_keywords: Optional[str] = None
    skills: List[str] = []
    city: Optional[str] = None
    work_mode: Optional[str] = None
    min_salary: Optional[float] = None
    frequency: str
    is_active: bool
    created_at: datetime

class JobNotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    job_id: Optional[int] = None
    alert_id: Optional[int] = None

