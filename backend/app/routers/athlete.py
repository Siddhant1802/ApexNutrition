from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AthleteProfile
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/athlete-profile", tags=["athlete"])

# Request/Response Models
class AthleteProfileCreate(BaseModel):
    sport: str
    weight: float
    height: float
    age: int
    gender: str
    body_fat: Optional[float] = None
    activity_level: str
    training_phase: str
    bmr: int
    tdee: int
    training_day_calories: int
    training_day_protein: int
    training_day_carbs: int
    training_day_fat: int
    rest_day_calories: int
    rest_day_protein: int
    rest_day_carbs: int
    rest_day_fat: int
    macro_ratio_protein: int
    macro_ratio_carbs: int
    macro_ratio_fat: int

class AthleteProfileResponse(BaseModel):
    id: str
    user_id: str
    primary_sport: str
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    training_phase: str
    bmr: Optional[int]
    tdee: Optional[int]
    training_day_calories: Optional[int]
    training_day_protein_g: Optional[int]
    training_day_carbs_g: Optional[int]
    training_day_fat_g: Optional[int]
    rest_day_calories: Optional[int]
    rest_day_protein_g: Optional[int]
    rest_day_carbs_g: Optional[int]
    rest_day_fat_g: Optional[int]

    class Config:
        from_attributes = True

# Create or Update Athlete Profile
@router.post("", response_model=AthleteProfileResponse)
def create_or_update_profile(
    profile_data: AthleteProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if profile already exists
    existing_profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()

    # Map frontend field names to database column names
    db_data = {
        "primary_sport": profile_data.sport,
        "weight_kg": profile_data.weight,
        "height_cm": profile_data.height,
        "age": profile_data.age,
        "gender": profile_data.gender,
        "training_phase": profile_data.training_phase,
        "bmr": profile_data.bmr,
        "tdee": profile_data.tdee,
        "training_day_calories": profile_data.training_day_calories,
        "training_day_protein_g": profile_data.training_day_protein,
        "training_day_carbs_g": profile_data.training_day_carbs,
        "training_day_fat_g": profile_data.training_day_fat,
        "rest_day_calories": profile_data.rest_day_calories,
        "rest_day_protein_g": profile_data.rest_day_protein,
        "rest_day_carbs_g": profile_data.rest_day_carbs,
        "rest_day_fat_g": profile_data.rest_day_fat,
        "competition_level": "competitive",  # Default value
        "primary_goal": "performance",  # Default value
    }

    if existing_profile:
        # Update existing profile
        for key, value in db_data.items():
            setattr(existing_profile, key, value)
        db.commit()
        db.refresh(existing_profile)
        return existing_profile
    else:
        # Create new profile
        new_profile = AthleteProfile(
            user_id=current_user.id,
            **db_data
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile

# Get Current User's Profile
@router.get("", response_model=AthleteProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile