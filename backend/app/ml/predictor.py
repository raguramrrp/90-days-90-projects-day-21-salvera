import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

from backend.app.core.config import settings

class SalaryPredictor:
    _instance = None
    _bundle = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.artifact_path = settings.MODELS_DIR / "salary_model.joblib"
        self._load_bundle()

    def _load_bundle(self):
        if self.artifact_path.exists():
            try:
                self._bundle = joblib.load(self.artifact_path)
            except Exception as e:
                print(f"Warning: Failed to load model bundle from {self.artifact_path}: {e}")
                self._bundle = None
        else:
            self._bundle = None

    def is_ready(self) -> bool:
        return self._bundle is not None

    def predict(
        self,
        role_title: str,
        experience_years: float,
        city: str,
        skills: List[str],
        industry: str = "Information Technology",
        employment_type: str = "Full-time"
    ) -> Dict[str, Any]:
        if not self.is_ready():
            self._load_bundle()
            if not self.is_ready():
                raise RuntimeError("Salary ML model artifact not found. Please train model using train_model.py.")

        bundle = self._bundle
        model = bundle["model"]
        preprocessor = bundle["preprocessor"]
        skill_encoder = bundle["skill_encoder"]
        residual_std = bundle.get("residual_std", 150000.0)
        
        # Format input into single-row DataFrame
        df_input = pd.DataFrame([{
            "job_title": role_title,
            "city": city,
            "industry": industry,
            "employment_type": employment_type,
            "experience_years": float(experience_years)
        }])
        
        dense_features = preprocessor.transform(df_input)
        skills_features = skill_encoder.transform(pd.Series([[s.strip() for s in skills]]))
        
        X_infer = np.hstack([dense_features, skills_features])
        raw_pred = float(model.predict(X_infer)[0])
        
        # 90% confidence prediction interval (z=1.645)
        interval_margin = 1.645 * residual_std
        lower_bound = max(280000.0, raw_pred - interval_margin)
        upper_bound = raw_pred + interval_margin
        
        # Round to thousands
        pred_annual = round(raw_pred, -3)
        lower_bound = round(lower_bound, -3)
        upper_bound = round(upper_bound, -3)
        
        # Extract relevant feature contributions for this specific query
        contributions = []
        top_features = bundle.get("feature_importance", [])[:8]
        for f in top_features:
            fname = f["feature"]
            # Check if this feature matches user inputs
            is_active = False
            if "Role: " in fname and role_title.lower() in fname.lower():
                is_active = True
            elif "City: " in fname and city.lower() in fname.lower():
                is_active = True
            elif "Skill: " in fname:
                s_name = fname.replace("Skill: ", "")
                if any(s.lower() == s_name.lower() for s in skills):
                    is_active = True
            elif "experience_years" in fname:
                is_active = True

            contributions.append({
                "factor": fname,
                "importance_weight": f["importance"],
                "active_in_profile": is_active
            })

        return {
            "predicted_annual_salary": pred_annual,
            "predicted_monthly_salary": round(pred_annual / 12.0, -2),
            "lower_bound_salary": lower_bound,
            "upper_bound_salary": upper_bound,
            "confidence_interval_percentage": 90,
            "currency": "INR",
            "model_version": bundle.get("version", "1.0.0"),
            "algorithm": bundle.get("best_algorithm", "GradientBoostingRegressor"),
            "feature_contributions": contributions,
            "comparable_records_count": 0  # will be computed against DB
        }
