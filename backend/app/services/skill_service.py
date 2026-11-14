from typing import List, Dict, Any, Optional
import numpy as np
from collections import Counter
from itertools import combinations
from sqlalchemy.orm import Session
from backend.app.database.models import SalaryRecord, Skill, JobRole, Location
from backend.app.schemas.schemas import SkillRankItem, SkillComparisonProfile, SkillCombinationItem

class SkillService:
    @staticmethod
    def get_skill_rankings(db: Session, category: Optional[str] = None, role_id: Optional[int] = None) -> List[SkillRankItem]:
        query = db.query(SalaryRecord.skills_list, SalaryRecord.normalized_annual_salary)
        if role_id:
            query = query.filter(SalaryRecord.role_id == role_id)
            
        rows = query.all()
        total_records = len(rows)
        if total_records == 0:
            return []

        # Map skills to their salaries
        skill_salaries: Dict[str, List[float]] = {}
        for skills, sal in rows:
            if skills:
                for s in skills:
                    if s not in skill_salaries:
                        skill_salaries[s] = []
                    skill_salaries[s].append(sal)

        # Fetch category map
        skills_db = db.query(Skill).all()
        cat_map = {s.skill_name: s.category for s in skills_db}

        items = []
        for s_name, sals in skill_salaries.items():
            s_cat = cat_map.get(s_name, "General")
            if category and category.lower() != "all" and s_cat.lower() != category.lower():
                continue
                
            arr = np.array(sals)
            items.append(SkillRankItem(
                skill_name=s_name,
                category=s_cat,
                frequency_count=len(sals),
                percentage=round((len(sals) / total_records) * 100.0, 1),
                median_salary=round(float(np.median(arr)), 2),
                p25_salary=round(float(np.percentile(arr, 25)), 2),
                p75_salary=round(float(np.percentile(arr, 75)), 2)
            ))

        # Sort by frequency count descending
        items.sort(key=lambda x: x.frequency_count, reverse=True)
        return items

    @staticmethod
    def compare_skill_profiles(
        db: Session,
        profiles_skills: List[List[str]],
        role_filter: Optional[str] = None,
        city_filter: Optional[str] = None
    ) -> List[SkillComparisonProfile]:
        query = db.query(
            SalaryRecord.skills_list,
            SalaryRecord.normalized_annual_salary,
            SalaryRecord.experience_years,
            SalaryRecord.role_id,
            SalaryRecord.location_id
        )
        if role_filter:
            query = query.join(JobRole).filter(JobRole.canonical_title == role_filter)
        if city_filter:
            query = query.join(Location).filter(Location.city == city_filter)

        all_records = query.all()
        roles_dict = {r.id: r.canonical_title for r in db.query(JobRole).all()}
        locs_dict = {l.id: l.city for l in db.query(Location).all()}

        results = []
        for skills_req in profiles_skills:
            req_set = set([s.strip().lower() for s in skills_req if s.strip()])
            label = " + ".join(skills_req) if skills_req else "All Records"

            matched_sals = []
            matched_exps = []
            matched_roles = []
            matched_locs = []

            for row_skills, sal, exp, r_id, l_id in all_records:
                if not row_skills:
                    continue
                row_skill_set = set([s.lower() for s in row_skills])
                # Check if all required skills are present
                if req_set.issubset(row_skill_set):
                    matched_sals.append(sal)
                    matched_exps.append(exp)
                    matched_roles.append(roles_dict.get(r_id, "Tech"))
                    matched_locs.append(locs_dict.get(l_id, "City"))

            if matched_sals:
                s_arr = np.array(matched_sals)
                top_r = [item for item, _ in Counter(matched_roles).most_common(3)]
                top_l = [item for item, _ in Counter(matched_locs).most_common(3)]
                results.append(SkillComparisonProfile(
                    profile_label=label,
                    skills_required=skills_req,
                    matching_records=len(matched_sals),
                    median_salary=round(float(np.median(s_arr)), 2),
                    p25_salary=round(float(np.percentile(s_arr, 25)), 2),
                    p75_salary=round(float(np.percentile(s_arr, 75)), 2),
                    avg_experience=round(float(np.mean(matched_exps)), 1),
                    common_roles=top_r,
                    top_locations=top_l
                ))
            else:
                results.append(SkillComparisonProfile(
                    profile_label=label,
                    skills_required=skills_req,
                    matching_records=0,
                    median_salary=0.0,
                    p25_salary=0.0,
                    p75_salary=0.0,
                    avg_experience=0.0,
                    common_roles=[],
                    top_locations=[]
                ))

        return results

    @staticmethod
    def get_skill_combinations(db: Session, top_n: int = 15) -> List[SkillCombinationItem]:
        records = db.query(SalaryRecord.skills_list, SalaryRecord.normalized_annual_salary).all()
        overall_salaries = [r[1] for r in records]
        overall_median = float(np.median(overall_salaries)) if overall_salaries else 1.0

        pair_counts = Counter()
        pair_salaries = {}

        for skills, sal in records:
            if not skills or len(skills) < 2:
                continue
            sorted_skills = sorted(list(set(skills)))
            for pair in combinations(sorted_skills, 2):
                pair_counts[pair] += 1
                if pair not in pair_salaries:
                    pair_salaries[pair] = []
                pair_salaries[pair].append(sal)

        results = []
        for pair, count in pair_counts.most_common(top_n):
            sals = pair_salaries[pair]
            med = float(np.median(sals))
            lift = round(((med - overall_median) / overall_median) * 100.0, 1)
            results.append(SkillCombinationItem(
                skill_a=pair[0],
                skill_b=pair[1],
                co_occurrence_count=count,
                median_salary=round(med, 2),
                relative_lift=lift
            ))
        return results
