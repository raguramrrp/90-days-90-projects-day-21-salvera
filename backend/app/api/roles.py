import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import RoleOverviewOut, RoleComparisonItem
from backend.app.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Role Explorer"])

class RoleCompareRequest(BaseModel):
    role_ids: List[int]

@router.get("", response_model=List[RoleOverviewOut])
def get_roles(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return RoleService.get_all_roles(db, category=category)

@router.get("/{role_id}")
def get_role_detail(role_id: int, db: Session = Depends(get_db)):
    detail = RoleService.get_role_detail(db, role_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Role not found")
    return detail

@router.post("/compare", response_model=List[RoleComparisonItem])
def compare_roles(payload: RoleCompareRequest, db: Session = Depends(get_db)):
    return RoleService.compare_roles(db, payload.role_ids[:4])

@router.get("/export-csv")
def export_roles_csv(db: Session = Depends(get_db)):
    roles = RoleService.get_all_roles(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Role Title", "Category", "Record Count", "Median Salary (INR)", "P25 Salary", "P75 Salary", "Min Salary", "Max Salary", "Typical Experience", "Common Skills"])
    for r in roles:
        writer.writerow([
            r.canonical_title, r.category, r.record_count, r.median_salary,
            r.p25_salary, r.p75_salary, r.min_salary, r.max_salary,
            r.typical_experience, "; ".join(r.common_skills)
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salvera_roles_intelligence.csv"}
    )
