from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database.models import CareerPlan, CareerPlanSkill, JobRole, RoleSkill, Skill
from backend.app.schemas.schemas import CareerPlanCreate, CareerPlanOut, CareerPlanSkillIn, CareerPlanSkillOut

class CareerService:
    @classmethod
    def get_or_create_plan(cls, db: Session, plan_id: Optional[int] = None) -> CareerPlanOut:
        if plan_id:
            plan = db.query(CareerPlan).filter(CareerPlan.id == plan_id).first()
        else:
            plan = db.query(CareerPlan).order_by(CareerPlan.created_at.desc()).first()

        if not plan:
            # Create default plan
            role = db.query(JobRole).first()
            role_id = role.id if role else 1
            role_title = role.canonical_title if role else "Data Scientist"
            plan = CareerPlan(
                current_role="Student / Junior Engineer",
                target_role_id=role_id,
                target_role_title=role_title,
                target_date="2025-12-31",
                target_salary_expectation=1600000.0
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)

        return cls._format_plan_response(plan)

    @classmethod
    def create_plan_from_analysis(cls, db: Session, plan_in: CareerPlanCreate) -> CareerPlanOut:
        target_role = db.query(JobRole).filter(JobRole.id == plan_in.target_role_id).first()
        target_title = target_role.canonical_title if target_role else "Target Role"

        plan = CareerPlan(
            current_role=plan_in.current_role,
            target_role_id=plan_in.target_role_id,
            target_role_title=target_title,
            target_date=plan_in.target_date,
            target_salary_expectation=plan_in.target_salary_expectation
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        # Generate Gap Analysis from empirical role_skills
        role_skills = db.query(RoleSkill).filter(RoleSkill.role_id == plan.target_role_id).order_by(RoleSkill.frequency.desc()).all()
        user_skills_lower = set([s.strip().lower() for s in plan_in.current_skills])

        order_idx = 1
        for rs in role_skills:
            s_name = rs.skill.skill_name
            if s_name.lower() in user_skills_lower:
                # Already possessed
                cat = "current_strength"
                prio = "Low"
                status = "Completed"
            elif rs.frequency >= 0.75:
                cat = "core_gap"
                prio = "High"
                status = "Planned"
            elif rs.frequency >= 0.60:
                cat = "recommended_addition"
                prio = "Medium"
                status = "Planned"
            else:
                cat = "advanced_specialization"
                prio = "Low"
                status = "Planned"

            db.add(CareerPlanSkill(
                career_plan_id=plan.id,
                skill_name=s_name,
                category=cat,
                priority=prio,
                completion_status=status,
                order_index=order_idx,
                target_date=plan_in.target_date,
                notes=f"Appears in {int(rs.frequency * 100)}% of benchmark records for {target_title}"
            ))
            order_idx += 1

        db.commit()
        db.refresh(plan)
        return cls._format_plan_response(plan)

    @classmethod
    def update_skill_status(cls, db: Session, skill_id: int, status: str, notes: Optional[str] = None) -> bool:
        skill = db.query(CareerPlanSkill).filter(CareerPlanSkill.id == skill_id).first()
        if not skill:
            return False
        skill.completion_status = status
        if notes is not None:
            skill.notes = notes
        db.commit()
        return True

    @classmethod
    def add_custom_skill(cls, db: Session, plan_id: int, skill_in: CareerPlanSkillIn) -> CareerPlanSkillOut:
        skill = CareerPlanSkill(
            career_plan_id=plan_id,
            skill_name=skill_in.skill_name,
            category=skill_in.category,
            priority=skill_in.priority,
            completion_status=skill_in.completion_status,
            order_index=skill_in.order_index,
            target_date=skill_in.target_date,
            notes=skill_in.notes
        )
        db.add(skill)
        db.commit()
        db.refresh(skill)
        return CareerPlanSkillOut.model_validate(skill)

    @classmethod
    def delete_skill(cls, db: Session, skill_id: int) -> bool:
        skill = db.query(CareerPlanSkill).filter(CareerPlanSkill.id == skill_id).first()
        if not skill:
            return False
        db.delete(skill)
        db.commit()
        return True

    @staticmethod
    def _format_plan_response(plan: CareerPlan) -> CareerPlanOut:
        all_skills = sorted(plan.skills, key=lambda x: x.order_index)
        possessed = [s.skill_name for s in all_skills if s.completion_status == "Completed"]
        
        total_skills = len(all_skills)
        completed_skills = len([s for s in all_skills if s.completion_status == "Completed"])
        pct = round((completed_skills / total_skills) * 100.0, 1) if total_skills > 0 else 0.0

        return CareerPlanOut(
            id=plan.id,
            current_role=plan.current_role,
            target_role_id=plan.target_role_id,
            target_role_title=plan.target_role_title,
            target_date=plan.target_date,
            target_salary_expectation=plan.target_salary_expectation,
            skills_possessed=possessed,
            skills_gap=[CareerPlanSkillOut.model_validate(s) for s in all_skills],
            completion_percentage=pct,
            created_at=plan.created_at,
            updated_at=plan.updated_at
        )
