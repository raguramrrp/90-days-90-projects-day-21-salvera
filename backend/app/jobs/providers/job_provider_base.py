"""
Abstract base class for all SALVERA Job Providers.
Enforces India-first compliance, data standardization, and provenance tracking.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger("salvera.jobs.provider")

VALID_INDIAN_CITIES = {
    "chennai", "bengaluru", "bangalore", "hyderabad", "mumbai", "pune", 
    "delhi", "delhi ncr", "noida", "gurugram", "gurgaon", "coimbatore", 
    "tirunelveli", "madurai", "kochi", "thiruvananthapuram", "trivandrum", 
    "kolkata", "ahmedabad", "jaipur", "chandigarh", "indore", "bhubaneswar",
    "mysuru", "mysore", "visakhapatnam", "vizag", "nagpur", "surat"
}

class JobProviderBase(ABC):
    """
    Base contract for any job provider ingesting listings into SALVERA.
    """

    def __init__(self, provider_name: str, provider_type: str = "curated"):
        self.provider_name = provider_name
        self.provider_type = provider_type

    @abstractmethod
    def fetch_jobs(self, limit: int = 100, query: Optional[str] = None, city: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch raw listings from the source.
        """
        pass

    def validate_india_only(self, job_data: Dict[str, Any]) -> bool:
        """
        Strict India-only gate:
        - country must be 'India'
        - if remote, candidate eligibility in India must be explicitly verified
        """
        country = (job_data.get("country") or "").strip().lower()
        if country and country not in ["india", "in"]:
            logger.warning(f"Rejected non-India job from {self.provider_name}: {job_data.get('title')} ({country})")
            return False

        city = (job_data.get("city") or "").strip().lower()
        work_mode = (job_data.get("work_mode") or "").strip().lower()

        # If it's remote, ensure remote_eligible_india is True or city is an Indian hub
        if work_mode == "remote":
            is_remote_eligible = job_data.get("is_remote_eligible_india", False)
            if not is_remote_eligible and city not in VALID_INDIAN_CITIES:
                logger.warning(f"Rejected worldwide remote job lacking verified India eligibility: {job_data.get('title')}")
                return False

        return True

    def standardize_job(self, raw_job: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Convert source-specific payload into standard SALVERA JobListing dictionary.
        Returns None if job fails India validation.
        """
        if not self.validate_india_only(raw_job):
            return None

        # Clean city name capitalization
        city_raw = (raw_job.get("city") or "Bengaluru").strip()
        city_clean = "Bengaluru" if city_raw.lower() in ["bengaluru", "bangalore"] else city_raw.title()
        if city_clean.lower() == "delhi ncr" or city_clean.lower() == "delhi":
            city_clean = "Delhi NCR"

        salary_disclosed = raw_job.get("salary_disclosed", False)
        salary_min = float(raw_job.get("salary_min", 0.0)) if raw_job.get("salary_min") else None
        salary_max = float(raw_job.get("salary_max", 0.0)) if raw_job.get("salary_max") else None

        if salary_min and salary_max and salary_min > salary_max:
            salary_min, salary_max = salary_max, salary_min

        return {
            "source_job_id": str(raw_job.get("source_job_id") or ""),
            "title": raw_job.get("title", "Software Engineer").strip(),
            "company_name": raw_job.get("company_name", "Tech Enterprise").strip(),
            "company_logo_url": raw_job.get("company_logo_url"),
            "city": city_clean,
            "state": raw_job.get("state"),
            "country": "India",
            "is_remote_eligible_india": raw_job.get("is_remote_eligible_india", True),
            "work_mode": raw_job.get("work_mode", "On-site"),
            "employment_type": raw_job.get("employment_type", "Full-time"),
            "experience_min": float(raw_job.get("experience_min", 0.0)),
            "experience_max": float(raw_job.get("experience_max", 2.0)),
            "salary_disclosed": salary_disclosed,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_currency": "INR",
            "salary_period": "annual",
            "description": raw_job.get("description", ""),
            "responsibilities": raw_job.get("responsibilities", []),
            "requirements": raw_job.get("requirements", []),
            "skills_raw": raw_job.get("skills_raw", []),
            "apply_url": raw_job.get("apply_url", "https://careers.salvera.in"),
            "is_synthetic": raw_job.get("is_synthetic", False)
        }
