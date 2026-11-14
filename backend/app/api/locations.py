import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import LocationOverviewOut
from backend.app.services.location_service import LocationService

router = APIRouter(prefix="/locations", tags=["Location Intelligence"])

class CityCompareRequest(BaseModel):
    cities: List[str]

@router.get("", response_model=List[LocationOverviewOut])
def get_locations(db: Session = Depends(get_db)):
    return LocationService.get_all_locations(db)

@router.post("/compare")
def compare_locations(payload: CityCompareRequest, db: Session = Depends(get_db)):
    return LocationService.compare_locations(db, payload.cities)

@router.get("/export-csv")
def export_locations_csv(db: Session = Depends(get_db)):
    locs = LocationService.get_all_locations(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["City", "State", "Tier", "COL Benchmark Index", "Record Count", "Median Annual Salary (INR)", "P25 Salary", "P75 Salary", "Top Tech Roles", "Top Skills"])
    for l in locs:
        writer.writerow([
            l.city, l.state, l.tier, l.col_index, l.record_count,
            l.median_salary, l.p25_salary, l.p75_salary,
            "; ".join(l.top_roles), "; ".join(l.top_skills)
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=salvera_location_intelligence.csv"}
    )
