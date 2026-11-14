from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    ForeignKey, Text, JSON, Table
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(200), nullable=False)
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(500), nullable=True)
    licence = Column(String(200), default="Open Data / CC-BY")
    collection_period = Column(String(100), default="2024-2025")
    imported_at = Column(DateTime, default=utc_now)
    record_count = Column(Integer, default=0)
    file_hash = Column(String(100), nullable=True)
    is_synthetic = Column(Boolean, default=True)
    status = Column(String(50), default="ready")
    quality_score = Column(Float, default=95.0)
    metadata_json = Column(JSON, nullable=True)

    records = relationship("SalaryRecord", back_populates="dataset", cascade="all, delete-orphan")
    import_logs = relationship("ImportLog", back_populates="dataset", cascade="all, delete-orphan")


class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    canonical_title = Column(String(150), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Data & Analytics, Software Development, AI & ML, etc.
    description = Column(Text, nullable=True)

    records = relationship("SalaryRecord", back_populates="role")
    role_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(100), unique=True, index=True, nullable=False)
    normalized_name = Column(String(100), index=True, nullable=False)
    category = Column(String(100), index=True, default="General")

    role_skills = relationship("RoleSkill", back_populates="skill", cascade="all, delete-orphan")


class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    frequency = Column(Float, default=0.0)  # 0.0 to 1.0 (proportion of role postings mentioning skill)
    source_dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)

    role = relationship("JobRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_skills")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India")
    country_code = Column(String(10), default="IND")
    tier = Column(String(50), default="Tier 1")
    col_index = Column(Float, default=100.0)  # Cost of Living index benchmarked to 100

    records = relationship("SalaryRecord", back_populates="location")


class SalaryRecord(Base):
    __tablename__ = "salary_records"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    experience_years = Column(Float, nullable=False, index=True)
    industry = Column(String(100), index=True, default="Information Technology")
    employment_type = Column(String(50), index=True, default="Full-time")
    skills_list = Column(JSON, default=list)  # stored as JSON array of strings
    
    # Raw observed data
    original_salary = Column(Float, nullable=False)
    original_currency = Column(String(10), default="INR")
    compensation_period = Column(String(20), default="annual")
    
    # Normalized intelligence data
    normalized_annual_salary = Column(Float, nullable=False, index=True)  # in INR
    normalized_currency = Column(String(10), default="INR")
    survey_year = Column(Integer, default=2024, index=True)
    is_synthetic = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=utc_now)

    dataset = relationship("Dataset", back_populates="records")
    role = relationship("JobRole", back_populates="records")
    location = relationship("Location", back_populates="records")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    profile_name = Column(String(150), default="Professional Profile")
    current_role = Column(String(150), default="Aspiring Technologist")
    experience_years = Column(Float, default=1.0)
    preferred_location = Column(String(100), default="Bengaluru")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    skills = relationship("UserProfileSkill", back_populates="profile", cascade="all, delete-orphan")
    career_plans = relationship("CareerPlan", back_populates="profile", cascade="all, delete-orphan")


class UserProfileSkill(Base):
    __tablename__ = "user_profile_skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate")

    profile = relationship("UserProfile", back_populates="skills")


class OfferComparison(Base):
    __tablename__ = "offer_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, nullable=True)
    comparison_name = Column(String(200), default="Tech Offer Comparison 2025")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    offers = relationship("JobOffer", back_populates="comparison", cascade="all, delete-orphan")


class JobOffer(Base):
    __tablename__ = "job_offers"

    id = Column(Integer, primary_key=True, index=True)
    comparison_id = Column(Integer, ForeignKey("offer_comparisons.id", ondelete="CASCADE"), nullable=False)
    offer_name = Column(String(150), nullable=False)
    company_name = Column(String(150), nullable=False)
    role_title = Column(String(150), nullable=False)
    location_name = Column(String(100), default="Bengaluru")
    work_mode = Column(String(50), default="Hybrid")  # Remote, Hybrid, Onsite
    
    # Financial breakdown
    fixed_salary = Column(Float, default=0.0)        # Annual base pay
    variable_salary = Column(Float, default=0.0)     # Annual performance bonus
    joining_bonus = Column(Float, default=0.0)       # One-time joining cash
    annual_benefits = Column(Float, default=0.0)     # Non-cash annual perks (insurance, food, etc.)
    monthly_deductions = Column(Float, default=0.0)  # Taxes + PF + health copay
    
    # Monthly cost of living / personal overhead
    monthly_rent = Column(Float, default=0.0)
    monthly_commute = Column(Float, default=0.0)
    other_monthly_expenses = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=utc_now)

    comparison = relationship("OfferComparison", back_populates="offers")


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, nullable=True)
    item_type = Column(String(50), nullable=False)  # role, skill, location, industry
    item_name = Column(String(150), nullable=False)
    baseline_median_salary = Column(Float, nullable=True)
    baseline_sample_count = Column(Integer, nullable=True)
    filter_criteria = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class CareerPlan(Base):
    __tablename__ = "career_plans"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    current_role = Column(String(150), default="Student / Junior Engineer")
    target_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    target_role_title = Column(String(150), nullable=False)
    target_date = Column(String(50), nullable=True)
    target_salary_expectation = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    profile = relationship("UserProfile", back_populates="career_plans")
    target_role = relationship("JobRole")
    skills = relationship("CareerPlanSkill", back_populates="career_plan", cascade="all, delete-orphan")


class CareerPlanSkill(Base):
    __tablename__ = "career_plan_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_plan_id = Column(Integer, ForeignKey("career_plans.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    category = Column(String(50), default="core_gap")  # core_gap, recommended_addition, advanced_specialization, current_strength
    priority = Column(String(20), default="High")       # High, Medium, Low
    completion_status = Column(String(50), default="Planned")  # Planned, In Progress, Completed
    order_index = Column(Integer, default=0)
    target_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    career_plan = relationship("CareerPlan", back_populates="skills")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(150), nullable=False)
    model_version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    training_dataset_id = Column(Integer, nullable=True)
    train_samples = Column(Integer, default=0)
    test_samples = Column(Integer, default=0)
    mae = Column(Float, default=0.0)
    rmse = Column(Float, default=0.0)
    r2_score = Column(Float, default=0.0)
    median_abs_error = Column(Float, default=0.0)
    feature_importance = Column(JSON, nullable=True)
    artifact_path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class SalaryPredictionLog(Base):
    __tablename__ = "salary_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id", ondelete="SET NULL"), nullable=True)
    role_title = Column(String(150), nullable=False)
    experience_years = Column(Float, nullable=False)
    location_name = Column(String(100), nullable=False)
    skills_list = Column(JSON, default=list)
    industry = Column(String(100), default="Information Technology")
    predicted_salary = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class ImportLog(Base):
    __tablename__ = "import_logs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)
    total_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    rejected_rows = Column(Integer, default=0)
    duplicate_rows = Column(Integer, default=0)
    error_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    dataset = relationship("Dataset", back_populates="import_logs")


# =====================================================================
# INDIA-FIRST JOB DISCOVERY & CAREER INTELLIGENCE MODELS
# =====================================================================

class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(150), unique=True, nullable=False)
    source_type = Column(String(50), default="curated")  # curated, api, direct, aggregator
    base_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime, nullable=True)
    jobs_count = Column(Integer, default=0)

    listings = relationship("JobListing", back_populates="source", cascade="all, delete-orphan")


class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("job_sources.id", ondelete="SET NULL"), nullable=True)
    source_job_id = Column(String(100), index=True, nullable=True)
    title = Column(String(200), index=True, nullable=False)
    canonical_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(200), index=True, nullable=False)
    company_logo_url = Column(String(500), nullable=True)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(50), default="India", nullable=False)  # Enforce India only!
    is_remote_eligible_india = Column(Boolean, default=False)
    work_mode = Column(String(50), default="On-site", index=True)  # On-site, Hybrid, Remote
    employment_type = Column(String(50), default="Full-time", index=True)  # Full-time, Internship, Contract
    experience_min = Column(Float, default=0.0, index=True)
    experience_max = Column(Float, default=1.0)
    salary_disclosed = Column(Boolean, default=False, index=True)
    salary_min = Column(Float, nullable=True)  # Annual INR
    salary_max = Column(Float, nullable=True)  # Annual INR
    salary_currency = Column(String(10), default="INR")
    salary_period = Column(String(20), default="annual")
    description = Column(Text, nullable=False)
    responsibilities = Column(JSON, default=list)
    requirements = Column(JSON, default=list)
    skills_raw = Column(JSON, default=list)
    apply_url = Column(String(1000), nullable=False)
    posted_at = Column(DateTime, default=utc_now, index=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    is_synthetic = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    source = relationship("JobSource", back_populates="listings")
    canonical_role = relationship("JobRole")
    job_skills = relationship("JobSkill", back_populates="listing", cascade="all, delete-orphan")
    saved_entries = relationship("SavedJob", back_populates="listing", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="listing", cascade="all, delete-orphan")


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    skill_name = Column(String(100), index=True, nullable=False)
    skill_type = Column(String(20), default="required")  # required, preferred

    listing = relationship("JobListing", back_populates="job_skills")
    skill = relationship("Skill")


class UserJobPreference(Base):
    __tablename__ = "user_job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", unique=True, index=True)
    profile_title = Column(String(150), default="Technology Professional")
    candidate_type = Column(String(50), default="Student")  # Student, Fresher, Working Professional, Career Switcher
    target_roles = Column(JSON, default=list)
    primary_skills = Column(JSON, default=list)
    secondary_skills = Column(JSON, default=list)
    experience_years = Column(Float, default=0.0)
    current_city = Column(String(100), default="Chennai")
    preferred_cities = Column(JSON, default=list)
    preferred_work_modes = Column(JSON, default=list)
    preferred_employment_types = Column(JSON, default=list)
    min_expected_salary = Column(Float, default=0.0)  # in INR Annual
    education_degree = Column(String(100), default="B.Tech Artificial Intelligence & Data Science")
    graduation_year = Column(Integer, default=2025)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class UserSearchHistory(Base):
    __tablename__ = "user_search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    query_text = Column(String(255), nullable=True)
    role_filter = Column(String(150), nullable=True)
    city_filter = Column(String(100), nullable=True)
    skills_filter = Column(JSON, default=list)
    experience_min = Column(Float, nullable=True)
    experience_max = Column(Float, nullable=True)
    work_mode_filter = Column(String(50), nullable=True)
    employment_type_filter = Column(String(50), nullable=True)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)


class UserJobInteraction(Base):
    __tablename__ = "user_job_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False)
    interaction_type = Column(String(50), nullable=False)  # view, click_apply, save, unsave, apply, dismiss
    created_at = Column(DateTime, default=utc_now)


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    listing = relationship("JobListing", back_populates="saved_entries")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="applied", index=True)  # saved, applied, interviewing, offered, rejected, archived
    company_name = Column(String(200), nullable=False)
    job_title = Column(String(200), nullable=False)
    applied_date = Column(DateTime, default=utc_now)
    interview_date = Column(DateTime, nullable=True)
    offered_salary = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    listing = relationship("JobListing", back_populates="applications")


class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    alert_title = Column(String(150), nullable=False)
    role_keywords = Column(String(200), nullable=True)
    skills = Column(JSON, default=list)
    city = Column(String(100), nullable=True)
    work_mode = Column(String(50), nullable=True)
    min_salary = Column(Float, nullable=True)
    frequency = Column(String(50), default="instant")  # instant, daily, weekly
    is_active = Column(Boolean, default=True)
    last_checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    notifications = relationship("JobNotification", back_populates="alert", cascade="all, delete-orphan")


class JobNotification(Base):
    __tablename__ = "job_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user", index=True)
    alert_id = Column(Integer, ForeignKey("job_alerts.id", ondelete="CASCADE"), nullable=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    alert = relationship("JobAlert", back_populates="notifications")
    job = relationship("JobListing")

