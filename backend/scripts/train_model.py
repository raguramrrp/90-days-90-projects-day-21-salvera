import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.ml.trainer import SalaryModelTrainer
from backend.app.database.session import SessionLocal
from backend.app.database.models import ModelVersion

def main():
    print("Training SALVERA machine learning compensation models...")
    trainer = SalaryModelTrainer()
    metrics = trainer.train_and_evaluate()
    
    # Record in database
    db = SessionLocal()
    try:
        best_algo = metrics["best_model"]
        best_eval = metrics["models_comparison"][best_algo]
        
        # Deactivate old versions
        db.query(ModelVersion).update({"is_active": False})
        
        mv = ModelVersion(
            model_name="SALVERA Tech Compensation Regressor",
            model_version=metrics["version"],
            algorithm=best_algo,
            train_samples=best_eval["train_samples"],
            test_samples=best_eval["test_samples"],
            mae=best_eval["mae"],
            rmse=best_eval["rmse"],
            r2_score=best_eval["r2_score"],
            median_abs_error=best_eval["median_abs_error"],
            feature_importance=metrics.get("top_features"),
            artifact_path="models/salary_model.joblib",
            is_active=True
        )
        db.add(mv)
        db.commit()
        print(f"Model version {metrics['version']} recorded in database.")
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to log model version to DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
