import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import DatasetOut, DatasetQualityMetric
from backend.app.services.dataset_service import DatasetService
from backend.app.core.config import settings

router = APIRouter(prefix="/datasets", tags=["Data & Quality Insights"])

@router.get("", response_model=List[DatasetOut])
def get_datasets(db: Session = Depends(get_db)):
    return DatasetService.get_all_datasets(db)

@router.get("/quality", response_model=DatasetQualityMetric)
def get_quality_report(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return DatasetService.get_quality_report(db, dataset_id)

@router.post("/upload")
def upload_dataset(
    file: UploadFile = File(...),
    is_synthetic: bool = Form(True),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are currently supported for ingestion.")

    uploads_dir = settings.DATA_DIR / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    temp_path = uploads_dir / file.filename

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = DatasetService.process_csv_upload(db, temp_path, file.filename, is_synthetic=is_synthetic)
    return result
