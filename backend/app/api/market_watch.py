from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.schemas import WatchlistCreate, WatchlistOut
from backend.app.services.market_watch_service import MarketWatchService

router = APIRouter(prefix="/watchlists", tags=["Market Watch"])

@router.get("", response_model=List[WatchlistOut])
def get_watchlists(db: Session = Depends(get_db)):
    return MarketWatchService.get_watchlist(db)

@router.post("", response_model=WatchlistOut)
def add_to_watchlist(item_in: WatchlistCreate, db: Session = Depends(get_db)):
    return MarketWatchService.add_watchlist_item(db, item_in)

@router.delete("/{item_id}")
def remove_from_watchlist(item_id: int, db: Session = Depends(get_db)):
    success = MarketWatchService.remove_watchlist_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    return {"status": "success", "message": "Item removed from watchlist"}
