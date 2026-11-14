from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy.orm import Session
from backend.app.database.models import Watchlist, SalaryRecord, JobRole, Skill, Location
from backend.app.schemas.schemas import WatchlistCreate, WatchlistOut

class MarketWatchService:
    @staticmethod
    def get_watchlist(db: Session) -> List[WatchlistOut]:
        items = db.query(Watchlist).all()
        results = []
        for item in items:
            # Calculate current metrics based on latest database records
            cur_sals = []
            if item.item_type == "role":
                role = db.query(JobRole).filter(JobRole.canonical_title.ilike(f"%{item.item_name}%")).first()
                if role:
                    cur_sals = [r[0] for r in db.query(SalaryRecord.normalized_annual_salary).filter(SalaryRecord.role_id == role.id).all()]
            elif item.item_type == "location":
                loc = db.query(Location).filter(Location.city.ilike(f"%{item.item_name}%")).first()
                if loc:
                    cur_sals = [r[0] for r in db.query(SalaryRecord.normalized_annual_salary).filter(SalaryRecord.location_id == loc.id).all()]
            elif item.item_type == "skill":
                # Match skill in JSON skills_list
                records = db.query(SalaryRecord.skills_list, SalaryRecord.normalized_annual_salary).all()
                for skills, sal in records:
                    if skills and any(item.item_name.lower() == s.lower() for s in skills):
                        cur_sals.append(sal)

            cur_count = len(cur_sals)
            cur_median = round(float(np.median(cur_sals)), 2) if cur_sals else None
            
            # Calculate percentage change against baseline
            change_pct = None
            if item.baseline_median_salary and cur_median:
                diff = cur_median - item.baseline_median_salary
                change_pct = round((diff / item.baseline_median_salary) * 100.0, 2)

            results.append(WatchlistOut(
                id=item.id,
                item_type=item.item_type,
                item_name=item.item_name,
                baseline_median_salary=item.baseline_median_salary,
                baseline_sample_count=item.baseline_sample_count,
                current_median_salary=cur_median,
                current_sample_count=cur_count,
                salary_change_pct=change_pct,
                created_at=item.created_at
            ))

        return results

    @staticmethod
    def add_watchlist_item(db: Session, item_in: WatchlistCreate) -> WatchlistOut:
        # Compute baseline from current data at time of adding
        cur_sals = []
        if item_in.item_type == "role":
            role = db.query(JobRole).filter(JobRole.canonical_title.ilike(f"%{item_in.item_name}%")).first()
            if role:
                cur_sals = [r[0] for r in db.query(SalaryRecord.normalized_annual_salary).filter(SalaryRecord.role_id == role.id).all()]
        elif item_in.item_type == "location":
            loc = db.query(Location).filter(Location.city.ilike(f"%{item_in.item_name}%")).first()
            if loc:
                cur_sals = [r[0] for r in db.query(SalaryRecord.normalized_annual_salary).filter(SalaryRecord.location_id == loc.id).all()]
        elif item_in.item_type == "skill":
            records = db.query(SalaryRecord.skills_list, SalaryRecord.normalized_annual_salary).all()
            for skills, sal in records:
                if skills and any(item_in.item_name.lower() == s.lower() for s in skills):
                    cur_sals.append(sal)

        baseline_med = round(float(np.median(cur_sals)), 2) if cur_sals else None
        baseline_cnt = len(cur_sals)

        item = Watchlist(
            item_type=item_in.item_type,
            item_name=item_in.item_name,
            baseline_median_salary=baseline_med,
            baseline_sample_count=baseline_cnt,
            filter_criteria=item_in.filter_criteria
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        return WatchlistOut(
            id=item.id,
            item_type=item.item_type,
            item_name=item.item_name,
            baseline_median_salary=baseline_med,
            baseline_sample_count=baseline_cnt,
            current_median_salary=baseline_med,
            current_sample_count=baseline_cnt,
            salary_change_pct=0.0,
            created_at=item.created_at
        )

    @staticmethod
    def remove_watchlist_item(db: Session, item_id: int) -> bool:
        item = db.query(Watchlist).filter(Watchlist.id == item_id).first()
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True
