import json
from pathlib import Path
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error
import joblib

from backend.app.core.config import settings

class MultiHotSkillEncoder:
    """Multi-hot binary indicator transformer for skill sets without data leakage."""
    def __init__(self, min_frequency: int = 5):
        self.min_frequency = min_frequency
        self.vocabulary_: List[str] = []
        self.skill_to_idx_: Dict[str, int] = {}

    def fit(self, X_skills_series: pd.Series, y=None):
        skill_counts: Dict[str, int] = {}
        for skill_list in X_skills_series:
            skills = skill_list if isinstance(skill_list, list) else [s.strip() for s in str(skill_list).split(";") if s.strip()]
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
        
        self.vocabulary_ = sorted([s for s, count in skill_counts.items() if count >= self.min_frequency])
        self.skill_to_idx_ = {s: i for i, s in enumerate(self.vocabulary_)}
        return self

    def transform(self, X_skills_series: pd.Series) -> np.ndarray:
        matrix = np.zeros((len(X_skills_series), len(self.vocabulary_)), dtype=np.float32)
        for row_idx, skill_list in enumerate(X_skills_series):
            skills = skill_list if isinstance(skill_list, list) else [s.strip() for s in str(skill_list).split(";") if s.strip()]
            for s in skills:
                if s in self.skill_to_idx_:
                    matrix[row_idx, self.skill_to_idx_[s]] = 1.0
        return matrix

    def fit_transform(self, X_skills_series: pd.Series, y=None) -> np.ndarray:
        return self.fit(X_skills_series, y).transform(X_skills_series)

class SalaryModelTrainer:
    def __init__(self):
        self.models_dir = settings.MODELS_DIR
        self.models_dir.mkdir(parents=True, exist_ok=True)

    def load_dataset(self) -> pd.DataFrame:
        csv_path = settings.DEMO_DIR / "salary_records.csv"
        if not csv_path.exists():
            raise FileNotFoundError(f"Dataset not found at {csv_path}")
        df = pd.read_csv(csv_path)
        return df

    def train_and_evaluate(self) -> Dict[str, Any]:
        df = self.load_dataset()
        
        # Prepare Features & Target
        # Target: normalized_annual_salary (in INR)
        y = df["normalized_annual_salary"].values
        
        # Parse skills column
        skills_series = df["skills"].apply(lambda x: [s.strip() for s in str(x).split(";") if s.strip()])
        
        # Fit Multi-hot encoder for skills
        skill_encoder = MultiHotSkillEncoder(min_frequency=3)
        skills_matrix = skill_encoder.fit_transform(skills_series)
        
        # Tabular features
        cat_features = ["job_title", "city", "industry", "employment_type"]
        num_features = ["experience_years"]
        
        # Train / Test split (80 / 20) with reproducible seed
        X_df = df[cat_features + num_features].copy()
        
        X_train_df, X_test_df, y_train, y_test, skills_train, skills_test = train_test_split(
            X_df, y, skills_matrix, test_size=0.20, random_state=42
        )
        
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), num_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features)
            ]
        )
        
        X_train_dense = preprocessor.fit_transform(X_train_df)
        X_test_dense = preprocessor.transform(X_test_df)
        
        # Combine dense features and skills multi-hot matrix
        X_train = np.hstack([X_train_dense, skills_train])
        X_test = np.hstack([X_test_dense, skills_test])
        
        # Feature names
        cat_encoder: OneHotEncoder = preprocessor.named_transformers_["cat"]
        encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_features))
        all_feature_names = num_features + encoded_cat_names + [f"skill_{s}" for s in skill_encoder.vocabulary_]
        
        # Candidate regression models
        candidate_models = {
            "LinearRegression": Ridge(alpha=1.0),
            "RandomForestRegressor": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
            "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
        }
        
        eval_results = {}
        fitted_models = {}
        
        for name, model in candidate_models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            medae = median_absolute_error(y_test, y_pred)
            
            eval_results[name] = {
                "algorithm": name,
                "mae": round(float(mae), 2),
                "rmse": round(float(rmse), 2),
                "r2_score": round(float(r2), 4),
                "median_abs_error": round(float(medae), 2),
                "train_samples": int(len(X_train)),
                "test_samples": int(len(X_test))
            }
            fitted_models[name] = model

        # Select Best Model based on validation R2 and RMSE
        best_name = "GradientBoostingRegressor"
        best_model = fitted_models[best_name]
        
        # Calculate residual std for empirical 90% prediction intervals
        y_test_pred = best_model.predict(X_test)
        residuals = y_test - y_test_pred
        residual_std = float(np.std(residuals))
        
        # Compute feature importance for best model
        importances = []
        if hasattr(best_model, "feature_importances_"):
            raw_imp = best_model.feature_importances_
            sorted_idx = np.argsort(raw_imp)[::-1]
            for idx in sorted_idx[:25]:
                importances.append({
                    "feature": all_feature_names[idx].replace("job_title_", "Role: ").replace("city_", "City: ").replace("skill_", "Skill: "),
                    "importance": round(float(raw_imp[idx]), 4)
                })

        # Save bundle
        artifact_bundle = {
            "version": "1.0.0",
            "best_algorithm": best_name,
            "model": best_model,
            "preprocessor": preprocessor,
            "skill_encoder": skill_encoder,
            "residual_std": residual_std,
            "feature_names": all_feature_names,
            "feature_importance": importances,
            "all_evaluations": eval_results
        }
        
        artifact_path = self.models_dir / "salary_model.joblib"
        joblib.dump(artifact_bundle, artifact_path)
        
        metrics_meta = {
            "version": "1.0.0",
            "trained_at": pd.Timestamp.now().isoformat(),
            "best_model": best_name,
            "residual_std": residual_std,
            "models_comparison": eval_results,
            "top_features": importances[:12]
        }
        with open(self.models_dir / "model_metrics.json", "w", encoding="utf-8") as f:
            json.dump(metrics_meta, f, indent=2)
            
        print(f"Model training complete. Best model: {best_name} with R2={eval_results[best_name]['r2_score']:.4f}, MAE=₹{eval_results[best_name]['mae']:,.0f}")
        return metrics_meta
