from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, WaterLog, AthleteProfile
from app.auth import get_current_user
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/water", tags=["water"])

class WaterLogCreate(BaseModel):
    amount_ml: int

@router.post("")
def log_water(
    water_data: WaterLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_log = WaterLog(
        user_id=current_user.id,
        amount_ml=water_data.amount_ml,
        date=date.today()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/today")
def get_today_water(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.date == today
    ).all()
    
    total_ml = sum(log.amount_ml for log in logs)
    
    # Get user's hydration goal from profile
    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()
    
    # Default goal based on weight (35ml per kg)
    goal_ml = 2500
    if profile and profile.weight_kg:
        goal_ml = int(profile.weight_kg * 35)
    
    return {
        "total_ml": total_ml,
        "goal_ml": goal_ml,
        "logs": [{"id": log.id, "amount_ml": log.amount_ml} for log in logs],
        "percentage": min(round((total_ml / goal_ml) * 100), 100)
    }

@router.delete("/{log_id}")
def delete_water_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(WaterLog).filter(
        WaterLog.id == log_id,
        WaterLog.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Deleted successfully"}