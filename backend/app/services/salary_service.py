import math
from typing import Dict, Any, List, Optional
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func, String
from backend.app.database.models import SalaryRecord, JobRole, Location
from backend.app.schemas.schemas import SalaryFilterParams, SalaryRecordOut, SalaryAnalyticsSummary

class SalaryService:
    @classmethod
    def apply_filters(cls, query, params: SalaryFilterParams, db: Session):
        need_role = bool(params.role_name or params.search)
        need_loc = bool(params.city or params.search)
        
        if need_role:
            query = query.join(JobRole, SalaryRecord.role_id == JobRole.id)
            
        if need_loc:
            query = query.join(Location, SalaryRecord.location_id == Location.id)
            
        if params.role_id:
            query = query.filter(SalaryRecord.role_id == params.role_id)
        elif params.role_name:
            query = query.filter(JobRole.canonical_title.ilike(f"%{params.role_name.strip()}%"))
            
        if params.city:
            query = query.filter(Location.city.ilike(f"%{params.city.strip()}%"))
            
        if params.search and params.search.strip():
            raw = params.search.strip()
            # Intelligent compound search handling, e.g. "Data Analyst in Chennai"
            if " in " in raw.lower():
                parts = raw.lower().split(" in ", 1)
                r_term = f"%{parts[0].strip()}%"
                c_term = f"%{parts[1].strip()}%"
                query = query.filter(
                    JobRole.canonical_title.ilike(r_term),
                    Location.city.ilike(c_term)
                )
            else:
                s = f"%{raw}%"
                query = query.filter(
                    (JobRole.canonical_title.ilike(s)) |
                    (JobRole.category.ilike(s)) |
                    (Location.city.ilike(s)) |
                    (SalaryRecord.industry.ilike(s)) |
                    (func.cast(SalaryRecord.skills_list, String).ilike(s))
                )
            
        if params.min_experience is not None:
            query = query.filter(SalaryRecord.experience_years >= params.min_experience)
        if params.max_experience is not None:
            query = query.filter(SalaryRecord.experience_years <= params.max_experience)
            
        if params.industry:
            query = query.filter(SalaryRecord.industry.ilike(f"%{params.industry.strip()}%"))
        if params.employment_type:
            query = query.filter(SalaryRecord.employment_type.ilike(f"%{params.employment_type.strip()}%"))
            
        return query

    @staticmethod
    def get_analytics_summary(salaries: List[float]) -> SalaryAnalyticsSummary:
        if not salaries:
            return SalaryAnalyticsSummary(
                record_count=0, median=0.0, mean=0.0, p25=0.0, p75=0.0,
                min_val=0.0, max_val=0.0,
                sample_reliability_warning="No matching records found for the selected criteria."
            )
            
        arr = np.array(salaries, dtype=np.float64)
        count = len(arr)
        
        warning = None
        if count < 10:
            warning = f"Caution: Small sample size ({count} records). Statistical metrics may carry high variance."
        elif count < 25:
            warning = f"Moderate sample size ({count} records). Directional indicator only."

        return SalaryAnalyticsSummary(
            record_count=count,
            median=round(float(np.median(arr)), 2),
            mean=round(float(np.mean(arr)), 2),
            p25=round(float(np.percentile(arr, 25)), 2),
            p75=round(float(np.percentile(arr, 75)), 2),
            min_val=round(float(np.min(arr)), 2),
            max_val=round(float(np.max(arr)), 2),
            currency="INR",
            sample_reliability_warning=warning
        )

    @classmethod
    def get_paginated_records(cls, db: Session, params: SalaryFilterParams) -> Dict[str, Any]:
        query = db.query(SalaryRecord)
        query = cls.apply_filters(query, params, db)
        
        # Pull all matching normalized salaries for true analytics
        all_salaries = [r[0] for r in query.with_entities(SalaryRecord.normalized_annual_salary).all()]
        analytics = cls.get_analytics_summary(all_salaries)
        
        total = len(all_salaries)
        page_size = max(1, min(params.page_size, 100))
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        page = max(1, min(params.page, total_pages))
        
        # Sorting
        sort_col = getattr(SalaryRecord, params.sort_by or "normalized_annual_salary", SalaryRecord.normalized_annual_salary)
        if params.sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())
            
        offset = (page - 1) * page_size
        records_db = query.offset(offset).limit(page_size).all()
        
        out_records = []
        for r in records_db:
            out_records.append(SalaryRecordOut(
                id=r.id,
                job_title=r.role.canonical_title if r.role else "Unknown",
                role_category=r.role.category if r.role else "General",
                city=r.location.city if r.location else "Unknown",
                state=r.location.state if r.location else "",
                country=r.location.country if r.location else "India",
                experience_years=r.experience_years,
                industry=r.industry,
                employment_type=r.employment_type,
                skills=r.skills_list or [],
                original_salary=r.original_salary,
                original_currency=r.original_currency,
                compensation_period=r.compensation_period,
                normalized_annual_salary=r.normalized_annual_salary,
                normalized_currency=r.normalized_currency,
                survey_year=r.survey_year,
                is_synthetic=r.is_synthetic
            ))

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "records": out_records,
            "analytics": analytics
        }

    @classmethod
    def get_distribution(cls, db: Session, params: SalaryFilterParams, bins: int = 12) -> List[Dict[str, Any]]:
        query = db.query(SalaryRecord.normalized_annual_salary)
        query = cls.apply_filters(query, params, db)
        salaries = [r[0] for r in query.all()]
        
        if not salaries:
            return []
            
        arr = np.array(salaries, dtype=np.float64)
        min_val = float(np.min(arr))
        max_val = float(np.max(arr))
        
        if min_val == max_val:
            return [{
                "bin_range": f"₹{min_val/100000:.1f}L",
                "min_salary": min_val,
                "max_salary": max_val,
                "count": len(arr),
                "percentage": 100.0
            }]

        counts, bin_edges = np.histogram(arr, bins=bins)
        total = len(arr)
        
        result = []
        for i in range(len(counts)):
            b_min = float(bin_edges[i])
            b_max = float(bin_edges[i+1])
            b_range = f"₹{b_min/100000:.1f}L - ₹{b_max/100000:.1f}L"
            result.append({
                "bin_range": b_range,
                "min_salary": round(b_min, 0),
                "max_salary": round(b_max, 0),
                "count": int(counts[i]),
                "percentage": round((counts[i] / total) * 100.0, 1)
            })
        return result

    @classmethod
    def get_by_experience(cls, db: Session, params: SalaryFilterParams) -> List[Dict[str, Any]]:
        brackets = [
            ("0-2 Years (Entry)", 0.0, 2.0),
            ("2-5 Years (Mid)", 2.0, 5.0),
            ("5-8 Years (Senior)", 5.0, 8.0),
            ("8-12 Years (Lead/Staff)", 8.0, 12.0),
            ("12+ Years (Principal/Arch)", 12.0, 40.0)
        ]
        
        # Keep all context filters (role, city, industry) but evaluate full experience spectrum
        bracket_params = params.model_copy(update={"min_experience": None, "max_experience": None})
        
        result = []
        for label, min_e, max_e in brackets:
            q = db.query(SalaryRecord.normalized_annual_salary).filter(
                SalaryRecord.experience_years >= min_e,
                SalaryRecord.experience_years < max_e
            )
            q = cls.apply_filters(q, bracket_params, db)
            sals = [r[0] for r in q.all()]
            if sals:
                arr = np.array(sals)
                result.append({
                    "experience_bracket": label,
                    "min_exp": min_e,
                    "max_exp": max_e,
                    "median_salary": round(float(np.median(arr)), 2),
                    "mean_salary": round(float(np.mean(arr)), 2),
                    "p25_salary": round(float(np.percentile(arr, 25)), 2),
                    "p75_salary": round(float(np.percentile(arr, 75)), 2),
                    "min_salary": round(float(np.min(arr)), 2),
                    "max_salary": round(float(np.max(arr)), 2),
                    "count": len(arr)
                })
            else:
                result.append({
                    "experience_bracket": label,
                    "min_exp": min_e,
                    "max_exp": max_e,
                    "median_salary": 0.0,
                    "mean_salary": 0.0,
                    "p25_salary": 0.0,
                    "p75_salary": 0.0,
                    "min_salary": 0.0,
                    "max_salary": 0.0,
                    "count": 0
                })
        return result

    @classmethod
    def get_scatter_sample(cls, db: Session, params: SalaryFilterParams, limit: int = 400) -> List[Dict[str, Any]]:
        query = db.query(SalaryRecord.experience_years, SalaryRecord.normalized_annual_salary, SalaryRecord.role_id, SalaryRecord.location_id)
        query = cls.apply_filters(query, params, db)
        records = query.limit(limit).all()
        
        roles_dict = {r.id: r.canonical_title for r in db.query(JobRole).all()}
        locs_dict = {l.id: l.city for l in db.query(Location).all()}
        
        return [
            {
                "experience": round(r[0], 1),
                "salary": round(r[1], 0),
                "salary_lpa": round(r[1] / 100000.0, 2),
                "role": roles_dict.get(r[2], "Tech Role"),
                "city": locs_dict.get(r[3], "Location")
            }
            for r in records
        ]
