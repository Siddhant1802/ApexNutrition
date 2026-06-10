from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Meal, AthleteProfile
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List
from datetime import date
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

router = APIRouter(prefix="/ai", tags=["ai"])

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("/chat")
def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user profile
    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get today's meals
    today = date.today()
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()
    
    # Calculate today's totals
    today_calories = sum(m.calories for m in meals)
    today_protein = sum(m.protein_g for m in meals)
    today_carbs = sum(m.carbs_g for m in meals)
    today_fat = sum(m.fat_g for m in meals)
    
    # Build system prompt with user context
    system_prompt = f"""You are an expert AI Nutrition Coach specializing in sports nutrition for athletes. You have access to the user's personal nutrition data and provide personalized, science-based advice.

USER PROFILE:
- Sport: {profile.primary_sport}
- Training Phase: {profile.training_phase}
- Weight: {profile.weight_kg}kg
- Height: {profile.height_cm}cm
- Age: {profile.age}
- Gender: {profile.gender}
- BMR: {profile.bmr} calories/day
- TDEE: {profile.tdee} calories/day

DAILY TARGETS:
Training Day: {profile.training_day_calories} cal | P: {profile.training_day_protein_g}g | C: {profile.training_day_carbs_g}g | F: {profile.training_day_fat_g}g
Rest Day: {profile.rest_day_calories} cal | P: {profile.rest_day_protein_g}g | C: {profile.rest_day_carbs_g}g | F: {profile.rest_day_fat_g}g

TODAY'S NUTRITION:
Total Consumed: {today_calories} cal | P: {today_protein}g | C: {today_carbs}g | F: {today_fat}g

Today's Meals:
{chr(10).join([f"- {m.meal_type}: {m.food_name} ({m.weight_grams}g) = {m.calories}cal, P:{m.protein_g}g, C:{m.carbs_g}g, F:{m.fat_g}g" for m in meals]) or 'No meals logged yet today'}

INSTRUCTIONS:
- Give personalized advice based on THIS user's actual data
- Be specific with numbers (e.g., "you need 70g more protein today")
- Consider their sport when giving advice
- Be encouraging but honest
- Keep responses concise and actionable
- Use emojis to make responses engaging
- Always relate advice to their athletic goals"""

    try:
        # Initialize Anthropic client
        client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        
        # Call Claude API
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            system=system_prompt,
            messages=[{"role": m.role, "content": m.content} for m in request.messages]
        )
        
        return {
            "response": response.content[0].text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))