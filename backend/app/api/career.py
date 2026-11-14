from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import CareerPlanCreate, CareerPlanOut, CareerPlanSkillIn, CareerPlanSkillOut
from backend.app.services.career_service import CareerService
from backend.app.services.pdf_export_service import PDFExportService

router = APIRouter(prefix="/career-plans", tags=["Career Planner"])

class SkillStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

@router.get("", response_model=CareerPlanOut)
def get_career_plan(plan_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return CareerService.get_or_create_plan(db, plan_id)

@router.post("", response_model=CareerPlanOut)
def create_career_plan(plan_in: CareerPlanCreate, db: Session = Depends(get_db)):
    return CareerService.create_plan_from_analysis(db, plan_in)

@router.put("/skills/{skill_id}")
def update_skill_status(skill_id: int, payload: SkillStatusUpdate, db: Session = Depends(get_db)):
    success = CareerService.update_skill_status(db, skill_id, payload.status, payload.notes)
    if not success:
        raise HTTPException(status_code=404, detail="Skill roadmap item not found")
    return {"status": "success", "message": "Skill roadmap milestone updated"}

@router.post("/{plan_id}/skills", response_model=CareerPlanSkillOut)
def add_custom_skill(plan_id: int, skill_in: CareerPlanSkillIn, db: Session = Depends(get_db)):
    return CareerService.add_custom_skill(db, plan_id, skill_in)

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    success = CareerService.delete_skill(db, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill roadmap item not found")
    return {"status": "success", "message": "Skill removed from roadmap"}

@router.get("/export-pdf")
def export_career_plan_pdf(plan_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    plan = CareerService.get_or_create_plan(db, plan_id)
    pdf_buffer = PDFExportService.generate_career_plan_pdf(plan.dict())
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=salvera_career_plan.pdf"}
    )
