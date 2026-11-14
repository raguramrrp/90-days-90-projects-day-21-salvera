import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import SalaryFilterParams, SalaryPaginatedResponse
from backend.app.services.salary_service import SalaryService

router = APIRouter(prefix="/salaries", tags=["Salary Explorer"])

@router.get("", response_model=SalaryPaginatedResponse)
def get_salaries(
    role_id: Optional[int] = Query(None),
    role_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    industry: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    sort_by: Optional[str] = Query("normalized_annual_salary"),
    sort_order: Optional[str] = Query("desc"),
    db: Session = Depends(get_db)
):
    params = SalaryFilterParams(
        role_id=role_id,
        role_name=role_name,
        city=city,
        min_experience=min_experience,
        max_experience=max_experience,
        industry=industry,
        employment_type=employment_type,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return SalaryService.get_paginated_records(db, params)

@router.get("/distribution")
def get_distribution(
    role_id: Optional[int] = Query(None),
    role_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    industry: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    bins: int = Query(12, ge=5, le=30),
    db: Session = Depends(get_db)
):
    params = SalaryFilterParams(
        role_id=role_id,
        role_name=role_name,
        city=city,
        min_experience=min_experience,
        max_experience=max_experience,
        industry=industry,
        employment_type=employment_type,
        search=search
    )
    return SalaryService.get_distribution(db, params, bins=bins)

@router.get("/by-experience")
def get_by_experience(
    role_id: Optional[int] = Query(None),
    role_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    industry: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    params = SalaryFilterParams(
        role_id=role_id,
        role_name=role_name,
        city=city,
        min_experience=min_experience,
        max_experience=max_experience,
        industry=industry,
        employment_type=employment_type,
        search=search
    )
    return SalaryService.get_by_experience(db, params)

@router.get("/scatter")
def get_scatter(
    role_id: Optional[int] = Query(None),
    role_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    industry: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(400, ge=50, le=1000),
    db: Session = Depends(get_db)
):
    params = SalaryFilterParams(
        role_id=role_id,
        role_name=role_name,
        city=city,
        min_experience=min_experience,
        max_experience=max_experience,
        industry=industry,
        employment_type=employment_type,
        search=search
    )
    return SalaryService.get_scatter_sample(db, params, limit=limit)

@router.get("/export-csv")
def export_salaries_csv(
    role_id: Optional[int] = Query(None),
    role_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    industry: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    params = SalaryFilterParams(
        role_id=role_id,
        role_name=role_name,
        city=city,
        min_experience=min_experience,
        max_experience=max_experience,
        industry=industry,
        employment_type=employment_type,
        search=search,
        page=1,
        page_size=10000
    )
    data = SalaryService.get_paginated_records(db, params)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Record ID", "Job Title", "Category", "City", "State", "Country",
        "Experience (Years)", "Industry", "Employment Type", "Skills",
        "Original Salary", "Original Currency", "Period",
        "Normalized Annual Salary (INR)", "Year", "Is Synthetic"
    ])
    for r in data["records"]:
        writer.writerow([
            r.id, r.job_title, r.role_category, r.city, r.state, r.country,
            r.experience_years, r.industry, r.employment_type, ";".join(r.skills),
            r.original_salary, r.original_currency, r.compensation_period,
            r.normalized_annual_salary, r.survey_year, r.is_synthetic
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salvera_salary_records.csv"}
    )
