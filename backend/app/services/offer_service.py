from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database.models import OfferComparison, JobOffer
from backend.app.schemas.schemas import JobOfferIn, JobOfferOut, FinancialDecomposition, OfferComparisonCreate, OfferComparisonOut

class OfferService:
    @staticmethod
    def calculate_financials(offer: JobOfferIn) -> FinancialDecomposition:
        fixed = float(offer.fixed_salary or 0.0)
        var_bonus = float(offer.variable_salary or 0.0)
        joining = float(offer.joining_bonus or 0.0)
        benefits = float(offer.annual_benefits or 0.0)
        m_deduct = float(offer.monthly_deductions or 0.0)
        m_rent = float(offer.monthly_rent or 0.0)
        m_commute = float(offer.monthly_commute or 0.0)
        m_other = float(offer.other_monthly_expenses or 0.0)

        total_ctc = fixed + var_bonus + joining + benefits
        recurring_gross_annual = fixed + var_bonus + benefits
        monthly_gross_eq = round(recurring_gross_annual / 12.0, 2)

        # Annualized statutory / tax deductions
        annual_deductions = m_deduct * 12.0
        
        # Monthly take-home estimate (Fixed + Variable portion less tax/deductions)
        cash_gross_annual = fixed + var_bonus
        net_cash_annual = max(0.0, cash_gross_annual - annual_deductions)
        monthly_take_home = round(net_cash_annual / 12.0, 2)

        total_m_expenses = m_rent + m_commute + m_other
        monthly_disposable = round(monthly_take_home - total_m_expenses, 2)

        return FinancialDecomposition(
            fixed_annual=fixed,
            variable_annual=var_bonus,
            one_time_joining=joining,
            annual_recurring_benefits=benefits,
            total_stated_ctc=total_ctc,
            recurring_gross_annual=recurring_gross_annual,
            monthly_gross_equivalent=monthly_gross_eq,
            estimated_annual_deductions=annual_deductions,
            estimated_monthly_take_home=monthly_take_home,
            total_monthly_expenses=total_m_expenses,
            estimated_monthly_disposable=monthly_disposable
        )

    @classmethod
    def get_comparison(cls, db: Session, comparison_id: Optional[int] = None) -> Optional[OfferComparisonOut]:
        if comparison_id:
            comp = db.query(OfferComparison).filter(OfferComparison.id == comparison_id).first()
        else:
            comp = db.query(OfferComparison).order_by(OfferComparison.created_at.desc()).first()

        if not comp:
            # Create default if none exists
            comp = OfferComparison(comparison_name="Tech Offer Comparison 2025")
            db.add(comp)
            db.commit()
            db.refresh(comp)

        offer_outs = []
        for o in comp.offers:
            fin = cls.calculate_financials(JobOfferIn(
                offer_name=o.offer_name,
                company_name=o.company_name,
                role_title=o.role_title,
                location_name=o.location_name,
                work_mode=o.work_mode,
                fixed_salary=o.fixed_salary,
                variable_salary=o.variable_salary,
                joining_bonus=o.joining_bonus,
                annual_benefits=o.annual_benefits,
                monthly_deductions=o.monthly_deductions,
                monthly_rent=o.monthly_rent,
                monthly_commute=o.monthly_commute,
                other_monthly_expenses=o.other_monthly_expenses
            ))
            offer_outs.append(JobOfferOut(
                id=o.id,
                comparison_id=o.comparison_id,
                offer_name=o.offer_name,
                company_name=o.company_name,
                role_title=o.role_title,
                location_name=o.location_name,
                work_mode=o.work_mode,
                fixed_salary=o.fixed_salary,
                variable_salary=o.variable_salary,
                joining_bonus=o.joining_bonus,
                annual_benefits=o.annual_benefits,
                monthly_deductions=o.monthly_deductions,
                monthly_rent=o.monthly_rent,
                monthly_commute=o.monthly_commute,
                other_monthly_expenses=o.other_monthly_expenses,
                financials=fin,
                created_at=o.created_at
            ))

        return OfferComparisonOut(
            id=comp.id,
            comparison_name=comp.comparison_name,
            notes=comp.notes,
            created_at=comp.created_at,
            offers=offer_outs
        )

    @classmethod
    def add_offer(cls, db: Session, comparison_id: int, offer_in: JobOfferIn) -> JobOfferOut:
        offer = JobOffer(
            comparison_id=comparison_id,
            offer_name=offer_in.offer_name,
            company_name=offer_in.company_name,
            role_title=offer_in.role_title,
            location_name=offer_in.location_name,
            work_mode=offer_in.work_mode,
            fixed_salary=offer_in.fixed_salary,
            variable_salary=offer_in.variable_salary,
            joining_bonus=offer_in.joining_bonus,
            annual_benefits=offer_in.annual_benefits,
            monthly_deductions=offer_in.monthly_deductions,
            monthly_rent=offer_in.monthly_rent,
            monthly_commute=offer_in.monthly_commute,
            other_monthly_expenses=offer_in.other_monthly_expenses
        )
        db.add(offer)
        db.commit()
        db.refresh(offer)

        fin = cls.calculate_financials(offer_in)
        return JobOfferOut(
            id=offer.id,
            comparison_id=offer.comparison_id,
            offer_name=offer.offer_name,
            company_name=offer.company_name,
            role_title=offer.role_title,
            location_name=offer.location_name,
            work_mode=offer.work_mode,
            fixed_salary=offer.fixed_salary,
            variable_salary=offer.variable_salary,
            joining_bonus=offer.joining_bonus,
            annual_benefits=offer.annual_benefits,
            monthly_deductions=offer.monthly_deductions,
            monthly_rent=offer.monthly_rent,
            monthly_commute=offer.monthly_commute,
            other_monthly_expenses=offer.other_monthly_expenses,
            financials=fin,
            created_at=offer.created_at
        )

    @classmethod
    def update_offer(cls, db: Session, offer_id: int, offer_in: JobOfferIn) -> Optional[JobOfferOut]:
        offer = db.query(JobOffer).filter(JobOffer.id == offer_id).first()
        if not offer:
            return None

        for k, v in offer_in.dict().items():
            setattr(offer, k, v)
            
        db.commit()
        db.refresh(offer)

        fin = cls.calculate_financials(offer_in)
        return JobOfferOut(
            id=offer.id,
            comparison_id=offer.comparison_id,
            offer_name=offer.offer_name,
            company_name=offer.company_name,
            role_title=offer.role_title,
            location_name=offer.location_name,
            work_mode=offer.work_mode,
            fixed_salary=offer.fixed_salary,
            variable_salary=offer.variable_salary,
            joining_bonus=offer.joining_bonus,
            annual_benefits=offer.annual_benefits,
            monthly_deductions=offer.monthly_deductions,
            monthly_rent=offer.monthly_rent,
            monthly_commute=offer.monthly_commute,
            other_monthly_expenses=offer.other_monthly_expenses,
            financials=fin,
            created_at=offer.created_at
        )

    @staticmethod
    def delete_offer(db: Session, offer_id: int) -> bool:
        offer = db.query(JobOffer).filter(JobOffer.id == offer_id).first()
        if not offer:
            return False
        db.delete(offer)
        db.commit()
        return True
