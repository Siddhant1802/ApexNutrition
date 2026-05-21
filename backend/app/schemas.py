from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserResponse(UserBase):
    id: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Athlete Profile Schemas
class AthleteProfileCreate(BaseModel):
    primary_sport: str
    sport_category: str
    position: Optional[str] = None
    competition_level: str
    training_phase: str
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    primary_goal: str

class AthleteProfileResponse(BaseModel):
    id: str
    user_id: str
    primary_sport: str
    sport_category: str
    weight_kg: float
    height_cm: float
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