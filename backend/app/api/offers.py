import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import JobOfferIn, JobOfferOut, OfferComparisonOut
from backend.app.services.offer_service import OfferService
from backend.app.services.pdf_export_service import PDFExportService

router = APIRouter(prefix="/offers", tags=["Offer Studio"])

@router.get("", response_model=OfferComparisonOut)
def get_offers_comparison(comparison_id: Optional[int] = None, db: Session = Depends(get_db)):
    comp = OfferService.get_comparison(db, comparison_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison scenario not found")
    return comp

@router.post("", response_model=JobOfferOut)
def create_offer(offer_in: JobOfferIn, comparison_id: Optional[int] = None, db: Session = Depends(get_db)):
    comp = OfferService.get_comparison(db, comparison_id)
    return OfferService.add_offer(db, comp.id, offer_in)

@router.put("/{offer_id}", response_model=JobOfferOut)
def update_offer(offer_id: int, offer_in: JobOfferIn, db: Session = Depends(get_db)):
    updated = OfferService.update_offer(db, offer_id, offer_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Offer not found")
    return updated

@router.delete("/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    success = OfferService.delete_offer(db, offer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"status": "success", "message": "Offer deleted successfully"}

@router.get("/export-pdf")
def export_offer_comparison_pdf(comparison_id: Optional[int] = None, db: Session = Depends(get_db)):
    comp = OfferService.get_comparison(db, comparison_id)
    comp_dict = comp.dict()
    pdf_buffer = PDFExportService.generate_offer_comparison_pdf(comp_dict)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=salvera_offer_comparison.pdf"}
    )

@router.get("/export-csv")
def export_offer_comparison_csv(comparison_id: Optional[int] = None, db: Session = Depends(get_db)):
    comp = OfferService.get_comparison(db, comparison_id)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Offer Name", "Company", "Role", "Location", "Work Mode",
        "Fixed Base (Annual)", "Variable Bonus (Annual)", "Joining Bonus (One-time)",
        "Annual Benefits", "Total Stated CTC", "Recurring Gross Annual",
        "Monthly Gross Equivalent", "Estimated Monthly Take-Home",
        "Monthly Living Expenses", "Estimated Monthly Disposable"
    ])
    for o in comp.offers:
        f = o.financials
        writer.writerow([
            o.offer_name, o.company_name, o.role_title, o.location_name, o.work_mode,
            o.fixed_salary, o.variable_salary, o.joining_bonus, o.annual_benefits,
            f.total_stated_ctc, f.recurring_gross_annual, f.monthly_gross_equivalent,
            f.estimated_monthly_take_home, f.total_monthly_expenses, f.estimated_monthly_disposable
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salvera_offer_comparison.csv"}
    )
