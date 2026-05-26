from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Meal
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter(prefix="/meals", tags=["meals"])

# Request/Response Models
class MealCreate(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snacks
    food_name: str
    weight_grams: float
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int

class MealResponse(BaseModel):
    id: str
    meal_type: str
    food_name: str
    weight_grams: float
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    date: date
    
    class Config:
        from_attributes = True

# Create a meal
@router.post("", response_model=MealResponse)
def create_meal(
    meal_data: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_meal = Meal(
        user_id=current_user.id,
        meal_type=meal_data.meal_type,
        food_name=meal_data.food_name,
        weight_grams=meal_data.weight_grams,
        calories=meal_data.calories,
        protein_g=meal_data.protein_g,
        carbs_g=meal_data.carbs_g,
        fat_g=meal_data.fat_g,
        date=date.today()
    )
    
    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)
    
    return new_meal

# Get today's meals
@router.get("/today", response_model=List[MealResponse])
def get_todays_meals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()
    
    return meals

# Delete a meal
@router.delete("/{meal_id}")
def delete_meal(
    meal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(meal)
    db.commit()
    
    return {"message": "Meal deleted successfully"}

# Get meals by date
@router.get("/date/{query_date}", response_model=List[MealResponse])
def get_meals_by_date(
    query_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == query_date
    ).all()
    
    return meals