from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User

router = APIRouter()

@router.get("/daily-summary")
def get_daily_summary(current_user: User = Depends(get_current_user)):
    """Get daily nutrition summary - Coming soon"""
    return {
        "message": "Daily nutrition summary",
        "user": current_user.email,
        "status": "Feature coming soon!"
    }

@router.get("/targets")
def get_nutrition_targets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's nutrition targets"""
    if not current_user.profile:
        return {"message": "Please complete your athlete profile first"}
    
    profile = current_user.profile
    
    return {
        "training_day": {
            "calories": profile.training_day_calories,
            "protein_g": profile.training_day_protein_g,
            "carbs_g": profile.training_day_carbs_g,
            "fat_g": profile.training_day_fat_g
        },
        "rest_day": {
            "calories": profile.rest_day_calories,
            "protein_g": profile.rest_day_protein_g,
            "carbs_g": profile.rest_day_carbs_g,
            "fat_g": profile.rest_day_fat_g
        },
        "hydration_ml": profile.base_hydration_ml
    }