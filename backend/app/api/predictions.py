import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import ModelVersion, SalaryPredictionLog, SalaryRecord, JobRole
from backend.app.schemas.schemas import SalaryPredictionRequest, SalaryPredictionResponse, ModelEvaluationOut
from backend.app.ml.predictor import SalaryPredictor
from backend.app.core.config import settings

router = APIRouter(prefix="/predictions", tags=["Salary Estimator / ML"])

@router.post("/salary", response_model=SalaryPredictionResponse)
def predict_salary(req: SalaryPredictionRequest, db: Session = Depends(get_db)):
    predictor = SalaryPredictor.get_instance()
    if not predictor.is_ready():
        raise HTTPException(
            status_code=503,
            detail="Salary ML model not initialized. Please ensure train_model.py has run."
        )

    pred_res = predictor.predict(
        role_title=req.role_title,
        experience_years=req.experience_years,
        city=req.city,
        skills=req.skills,
        industry=req.industry or "Information Technology",
        employment_type=req.employment_type or "Full-time"
    )

    # Check comparable records in DB
    role_obj = db.query(JobRole).filter(JobRole.canonical_title.ilike(f"%{req.role_title}%")).first()
    comp_count = 0
    if role_obj:
        comp_count = db.query(SalaryRecord).filter(
            SalaryRecord.role_id == role_obj.id,
            SalaryRecord.experience_years.between(max(0.0, req.experience_years - 1.5), req.experience_years + 1.5)
        ).count()
        
    pred_res["comparable_records_count"] = comp_count

    # Log prediction to DB
    active_mv = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    try:
        log_entry = SalaryPredictionLog(
            model_version_id=active_mv.id if active_mv else None,
            role_title=req.role_title,
            experience_years=req.experience_years,
            location_name=req.city,
            skills_list=req.skills,
            industry=req.industry or "Information Technology",
            predicted_salary=pred_res["predicted_annual_salary"],
            lower_bound=pred_res["lower_bound_salary"],
            upper_bound=pred_res["upper_bound_salary"]
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to log prediction: {e}")

    return SalaryPredictionResponse(**pred_res)

@router.get("/model-info")
def get_model_info(db: Session = Depends(get_db)):
    mv = db.query(ModelVersion).filter(ModelVersion.is_active == True).order_by(ModelVersion.created_at.desc()).first()
    if not mv:
        # Fallback to model_metrics.json
        meta_path = settings.MODELS_DIR / "model_metrics.json"
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="No active model metadata found.")

    return {
        "model_name": mv.model_name,
        "version": mv.model_version,
        "algorithm": mv.algorithm,
        "mae": mv.mae,
        "rmse": mv.rmse,
        "r2_score": mv.r2_score,
        "median_abs_error": mv.median_abs_error,
        "train_samples": mv.train_samples,
        "test_samples": mv.test_samples,
        "feature_importance": mv.feature_importance,
        "created_at": mv.created_at
    }

@router.get("/evaluation")
def get_model_evaluation():
    meta_path = settings.MODELS_DIR / "model_metrics.json"
    if not meta_path.exists():
        raise HTTPException(status_code=404, detail="Model evaluation metrics file not found.")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    return meta
