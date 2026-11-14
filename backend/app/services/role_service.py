from typing import List, Dict, Any, Optional
import numpy as np
from collections import Counter
from sqlalchemy.orm import Session
from backend.app.database.models import JobRole, SalaryRecord, RoleSkill, Skill, Location
from backend.app.schemas.schemas import RoleOverviewOut, RoleComparisonItem

class RoleService:
    @staticmethod
    def get_all_roles(db: Session, category: Optional[str] = None) -> List[RoleOverviewOut]:
        query = db.query(JobRole)
        if category and category.lower() != "all":
            query = query.filter(JobRole.category == category)
            
        roles = query.all()
        out = []
        for r in roles:
            sals = [rec[0] for rec in db.query(SalaryRecord.normalized_annual_salary).filter(SalaryRecord.role_id == r.id).all()]
            exps = [rec[0] for rec in db.query(SalaryRecord.experience_years).filter(SalaryRecord.role_id == r.id).all()]
            
            # Common skills from role_skills
            top_skills = [
                rs.skill.skill_name for rs in db.query(RoleSkill).filter(RoleSkill.role_id == r.id).order_by(RoleSkill.frequency.desc()).limit(6).all()
            ]
            
            # Top locations
            loc_ids = [rec[0] for rec in db.query(SalaryRecord.location_id).filter(SalaryRecord.role_id == r.id).all()]
            loc_names = [l.city for l in db.query(Location).filter(Location.id.in_(loc_ids)).all()] if loc_ids else []
            top_locs = [item for item, _ in Counter(loc_names).most_common(3)]
            
            if sals:
                arr = np.array(sals)
                med = float(np.median(arr))
                p25 = float(np.percentile(arr, 25))
                p75 = float(np.percentile(arr, 75))
                min_s = float(np.min(arr))
                max_s = float(np.max(arr))
            else:
                med = p25 = p75 = min_s = max_s = 0.0

            typical_exp = f"{min(exps):.0f}-{max(exps):.0f} yrs" if exps else "0-5 yrs"

            out.append(RoleOverviewOut(
                id=r.id,
                canonical_title=r.canonical_title,
                category=r.category,
                description=r.description,
                record_count=len(sals),
                median_salary=round(med, 2),
                p25_salary=round(p25, 2),
                p75_salary=round(p75, 2),
                min_salary=round(min_s, 2),
                max_salary=round(max_s, 2),
                common_skills=top_skills,
                typical_experience=typical_exp,
                top_locations=top_locs
            ))

        out.sort(key=lambda x: x.record_count, reverse=True)
        return out

    @staticmethod
    def get_role_detail(db: Session, role_id: int) -> Dict[str, Any]:
        role = db.query(JobRole).filter(JobRole.id == role_id).first()
        if not role:
            return {}

        records = db.query(SalaryRecord).filter(SalaryRecord.role_id == role.id).all()
        sals = [r.normalized_annual_salary for r in records]
        exps = [r.experience_years for r in records]

        arr = np.array(sals) if sals else np.array([0.0])
        
        # Skill frequency
        all_skills = []
        for r in records:
            if r.skills_list:
                all_skills.extend(r.skills_list)
        skill_counts = Counter(all_skills)
        skill_freq = [
            {"skill": k, "count": v, "percentage": round((v / len(records)) * 100.0, 1)}
            for k, v in skill_counts.most_common(12)
        ]

        # Location distribution
        loc_ids = [r.location_id for r in records]
        locs_dict = {l.id: l.city for l in db.query(Location).all()}
        loc_counts = Counter([locs_dict.get(lid, "Unknown") for lid in loc_ids])
        loc_dist = [{"city": k, "count": v} for k, v in loc_counts.most_common(7)]

        return {
            "id": role.id,
            "title": role.canonical_title,
            "category": role.category,
            "description": role.description,
            "record_count": len(records),
            "median_salary": round(float(np.median(arr)), 2),
            "p25_salary": round(float(np.percentile(arr, 25)), 2),
            "p75_salary": round(float(np.percentile(arr, 75)), 2),
            "min_salary": round(float(np.min(arr)), 2),
            "max_salary": round(float(np.max(arr)), 2),
            "avg_experience": round(float(np.mean(exps)), 1) if exps else 0.0,
            "skills_distribution": skill_freq,
            "location_distribution": loc_dist
        }

    @staticmethod
    def compare_roles(db: Session, role_ids: List[int]) -> List[RoleComparisonItem]:
        roles = db.query(JobRole).filter(JobRole.id.in_(role_ids)).all()
        out = []
        for r in roles:
            records = db.query(SalaryRecord).filter(SalaryRecord.role_id == r.id).all()
            sals = [rec.normalized_annual_salary for rec in records]
            exps = [rec.experience_years for rec in records]
            
            arr = np.array(sals) if sals else np.array([0.0])
            
            top_skills = [
                {"skill": rs.skill.skill_name, "frequency": rs.frequency}
                for rs in db.query(RoleSkill).filter(RoleSkill.role_id == r.id).order_by(RoleSkill.frequency.desc()).limit(6).all()
            ]
            
            loc_ids = [rec.location_id for rec in records]
            locs_dict = {l.id: l.city for l in db.query(Location).all()}
            top_cities = [item for item, _ in Counter([locs_dict.get(lid) for lid in loc_ids]).most_common(4)]

            out.append(RoleComparisonItem(
                id=r.id,
                title=r.canonical_title,
                category=r.category,
                record_count=len(records),
                median_salary=round(float(np.median(arr)), 2),
                p25_salary=round(float(np.percentile(arr, 25)), 2),
                p75_salary=round(float(np.percentile(arr, 75)), 2),
                min_exp=min(exps) if exps else 0.0,
                max_exp=max(exps) if exps else 0.0,
                key_skills=top_skills,
                top_cities=top_cities
            ))
        return out
