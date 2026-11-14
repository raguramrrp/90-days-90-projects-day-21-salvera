import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import SkillRankItem, SkillComparisonProfile, SkillCombinationItem
from backend.app.services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skill Intelligence"])

class SkillCompareRequest(BaseModel):
    profiles: List[List[str]]
    role_filter: Optional[str] = None
    city_filter: Optional[str] = None

@router.get("/rankings", response_model=List[SkillRankItem])
def get_rankings(
    category: Optional[str] = Query(None),
    role_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return SkillService.get_skill_rankings(db, category=category, role_id=role_id)

@router.post("/compare", response_model=List[SkillComparisonProfile])
def compare_skills(
    payload: SkillCompareRequest,
    db: Session = Depends(get_db)
):
    return SkillService.compare_skill_profiles(
        db,
        profiles_skills=payload.profiles,
        role_filter=payload.role_filter,
        city_filter=payload.city_filter
    )

@router.get("/combinations", response_model=List[SkillCombinationItem])
def get_combinations(
    top_n: int = Query(15, ge=5, le=50),
    db: Session = Depends(get_db)
):
    return SkillService.get_skill_combinations(db, top_n=top_n)

@router.get("/export-csv")
def export_skills_csv(db: Session = Depends(get_db)):
    rankings = SkillService.get_skill_rankings(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Skill Name", "Category", "Record Count", "Percentage of Records", "Median Annual Salary (INR)", "P25 Salary", "P75 Salary"])
    for r in rankings:
        writer.writerow([r.skill_name, r.category, r.frequency_count, f"{r.percentage}%", r.median_salary, r.p25_salary, r.p75_salary])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salvera_skill_intelligence.csv"}
    )
