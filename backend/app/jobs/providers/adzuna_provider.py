"""
Adzuna Job Provider for India (Country code: 'in').
Fetches live Indian tech job postings if credentials are provided.
Gracefully skips if credentials are not configured.
"""
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import httpx
from backend.app.jobs.providers.job_provider_base import JobProviderBase

logger = logging.getLogger("salvera.jobs.adzuna")

class AdzunaJobProvider(JobProviderBase):
    """
    Integrates Adzuna India API.
    API Docs: https://developer.adzuna.com/
    Requires ADZUNA_APP_ID and ADZUNA_APP_KEY.
    """

    def __init__(self):
        super().__init__(provider_name="Adzuna India", provider_type="api")
        self.app_id = os.getenv("ADZUNA_APP_ID")
        self.app_key = os.getenv("ADZUNA_APP_KEY")
        self.base_url = "https://api.adzuna.com/v1/api/jobs/in/search"

    @property
    def is_configured(self) -> bool:
        return bool(self.app_id and self.app_key)

    def fetch_jobs(self, limit: int = 50, query: Optional[str] = "technology", city: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.is_configured:
            logger.info("Adzuna API credentials not configured; skipping live Adzuna sync.")
            return []

        jobs: List[Dict[str, Any]] = []
        try:
            params = {
                "app_id": self.app_id,
                "app_key": self.app_key,
                "results_per_page": min(limit, 50),
                "what": query or "software developer",
                "content-type": "application/json"
            }
            if city:
                params["where"] = city

            with httpx.Client(timeout=10.0) as client:
                resp = client.get(f"{self.base_url}/1", params=params)
                if resp.status_code != 200:
                    logger.error(f"Adzuna API returned error {resp.status_code}: {resp.text}")
                    return []
                
                data = resp.json()
                results = data.get("results", [])
                for item in results:
                    loc = item.get("location", {})
                    area = loc.get("area", [])
                    city_found = area[-1] if area else "Bengaluru"

                    job_data = {
                        "source_job_id": str(item.get("id")),
                        "title": item.get("title", "Software Engineer"),
                        "company_name": item.get("company", {}).get("display_name", "Technology Enterprise"),
                        "city": city_found,
                        "state": area[-2] if len(area) > 1 else None,
                        "country": "India",
                        "is_remote_eligible_india": True,
                        "work_mode": "Hybrid" if "hybrid" in (item.get("description", "")).lower() else "On-site",
                        "employment_type": "Full-time",
                        "experience_min": 1.0,
                        "experience_max": 4.0,
                        "salary_disclosed": bool(item.get("salary_min") or item.get("salary_max")),
                        "salary_min": item.get("salary_min"),
                        "salary_max": item.get("salary_max"),
                        "description": item.get("description", ""),
                        "apply_url": item.get("redirect_url", "https://adzuna.in"),
                        "posted_at": datetime.now(timezone.utc),
                        "is_synthetic": False
                    }
                    std = self.standardize_job(job_data)
                    if std:
                        jobs.append(std)

        except Exception as e:
            logger.error(f"Failed to fetch Adzuna jobs: {e}")

        return jobs
