from typing import List, Dict, Any, Optional
import numpy as np
from collections import Counter
from sqlalchemy.orm import Session
from backend.app.database.models import Location, SalaryRecord, JobRole
from backend.app.schemas.schemas import LocationOverviewOut

class LocationService:
    @staticmethod
    def get_all_locations(db: Session) -> List[LocationOverviewOut]:
        locations = db.query(Location).all()
        out = []
        roles_dict = {r.id: r.canonical_title for r in db.query(JobRole).all()}

        for loc in locations:
            records = db.query(SalaryRecord).filter(SalaryRecord.location_id == loc.id).all()
            sals = [r.normalized_annual_salary for r in records]
            
            top_roles = [item for item, _ in Counter([roles_dict.get(r.role_id) for r in records]).most_common(3)]
            
            all_skills = []
            for r in records:
                if r.skills_list:
                    all_skills.extend(r.skills_list)
            top_skills = [item for item, _ in Counter(all_skills).most_common(5)]

            if sals:
                arr = np.array(sals)
                med = float(np.median(arr))
                p25 = float(np.percentile(arr, 25))
                p75 = float(np.percentile(arr, 75))
            else:
                med = p25 = p75 = 0.0

            out.append(LocationOverviewOut(
                id=loc.id,
                city=loc.city,
                state=loc.state,
                tier=loc.tier,
                record_count=len(sals),
                median_salary=round(med, 2),
                p25_salary=round(p25, 2),
                p75_salary=round(p75, 2),
                top_roles=top_roles,
                top_skills=top_skills,
                col_index=loc.col_index
            ))

        out.sort(key=lambda x: x.record_count, reverse=True)
        return out

    @staticmethod
    def compare_locations(db: Session, city_names: List[str]) -> List[Dict[str, Any]]:
        results = []
        roles_dict = {r.id: r.canonical_title for r in db.query(JobRole).all()}
        
        for c_name in city_names:
            loc = db.query(Location).filter(Location.city.ilike(f"%{c_name.strip()}%")).first()
            if not loc:
                continue
                
            records = db.query(SalaryRecord).filter(SalaryRecord.location_id == loc.id).all()
            sals = [r.normalized_annual_salary for r in records]
            exps = [r.experience_years for r in records]
            arr = np.array(sals) if sals else np.array([0.0])

            role_counts = Counter([roles_dict.get(r.role_id) for r in records])
            
            results.append({
                "city": loc.city,
                "state": loc.state,
                "tier": loc.tier,
                "col_index": loc.col_index,
                "record_count": len(sals),
                "median_salary": round(float(np.median(arr)), 2),
                "p25_salary": round(float(np.percentile(arr, 25)), 2),
                "p75_salary": round(float(np.percentile(arr, 75)), 2),
                "mean_salary": round(float(np.mean(arr)), 2),
                "avg_experience": round(float(np.mean(exps)), 1) if exps else 0.0,
                "top_roles": [{"role": k, "count": v} for k, v in role_counts.most_common(5)]
            })
            
        return results
