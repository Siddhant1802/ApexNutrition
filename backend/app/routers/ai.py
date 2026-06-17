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
    
class PreWorkoutRequest(BaseModel):
    hours_until_workout: float
    workout_type: str  # e.g. "long run", "interval training", "race"
    workout_intensity: str  # "easy", "moderate", "hard", "race day"

@router.post("/pre-workout")
def get_pre_workout_advice(
    request: PreWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    today = date.today()
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()

    today_calories = sum(m.calories for m in meals)
    today_protein = sum(m.protein_g for m in meals)
    today_carbs = sum(m.carbs_g for m in meals)
    today_fat = sum(m.fat_g for m in meals)

    last_meal = meals[-1] if meals else None
    last_meal_info = (
        f"{last_meal.food_name} ({last_meal.calories}cal) {last_meal.meal_type}"
        if last_meal else "No meals logged yet today"
    )

    system_prompt = f"""You are an expert sports nutritionist specializing in pre-workout fueling strategies for endurance and strength athletes.

ATHLETE PROFILE:
- Sport: {profile.primary_sport}
- Training Phase: {profile.training_phase}
- Weight: {profile.weight_kg}kg
- Daily Training Day Target: {profile.training_day_calories} cal | C: {profile.training_day_carbs_g}g | P: {profile.training_day_protein_g}g | F: {profile.training_day_fat_g}g

TODAY'S NUTRITION SO FAR:
Consumed: {today_calories} cal | C: {today_carbs}g | P: {today_protein}g | F: {today_fat}g
Last meal: {last_meal_info}

UPCOMING WORKOUT:
Type: {request.workout_type}
Intensity: {request.workout_intensity}
Time until workout: {request.hours_until_workout} hours

TASK:
Provide a specific, actionable pre-workout fueling plan with these EXACT sections:

1. RIGHT NOW (if workout is 2+ hours away, what to eat now)
2. CLOSER TO WORKOUT (30-60 min before, light snack/fuel)
3. HYDRATION PLAN (how much water/electrolytes and when)
4. AVOID (what NOT to eat before this specific workout)

Base your recommendations on:
- Sports science best practices (carb loading for endurance, etc.)
- The athlete's specific sport and intensity
- What they've already eaten today
- Time available before workout

Keep each section to 1-2 sentences. Be specific with food suggestions and quantities. Use emojis for each section header."""

    try:
        client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"Give me my pre-workout fueling plan for my {request.workout_type} in {request.hours_until_workout} hours."
            }]
        )

        return {
            "advice": response.content[0].text,
            "context": {
                "today_calories": today_calories,
                "today_carbs": today_carbs,
                "today_protein": today_protein,
                "hours_until": request.hours_until_workout,
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class RecoveryRequest(BaseModel):
    hours_since_workout: float
    workout_type: str
    workout_intensity: str

@router.post("/recovery")
def get_recovery_analysis(
    request: RecoveryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(AthleteProfile).filter(
        AthleteProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    today = date.today()
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()

    today_calories = sum(m.calories for m in meals)
    today_protein = sum(m.protein_g for m in meals)
    today_carbs = sum(m.carbs_g for m in meals)
    today_fat = sum(m.fat_g for m in meals)

    meals_list = "\n".join([
        f"- {m.meal_type}: {m.food_name} ({m.calories}cal, P:{m.protein_g}g, C:{m.carbs_g}g, F:{m.fat_g}g)"
        for m in meals
    ]) or "No meals logged yet today"

    recovery_window_open = request.hours_since_workout <= 1

    system_prompt = f"""You are an expert sports nutritionist specializing in post-workout recovery nutrition.

ATHLETE PROFILE:
- Sport: {profile.primary_sport}
- Training Phase: {profile.training_phase}
- Weight: {profile.weight_kg}kg
- Training Day Target: {profile.training_day_calories} cal | P: {profile.training_day_protein_g}g | C: {profile.training_day_carbs_g}g

WORKOUT JUST COMPLETED:
Type: {request.workout_type}
Intensity: {request.workout_intensity}
Time since workout ended: {request.hours_since_workout} hours
Recovery window (60 min): {"STILL OPEN" if recovery_window_open else "CLOSED"}

TODAY'S NUTRITION SO FAR:
Total: {today_calories} cal | P: {today_protein}g | C: {today_carbs}g | F: {today_fat}g

Meals logged today:
{meals_list}

TASK:
Analyze this athlete's recovery nutrition and provide:

1. A RECOVERY SCORE from 0-100 based on:
   - Whether protein target (~25-30g) was hit within the 60min post-workout window
   - Overall protein intake relative to their daily target
   - Carb replenishment for glycogen restoration
   - Time elapsed since workout

2. A SHORT VERDICT (one sentence, e.g. "Great recovery nutrition!" or "You're under-fueling your recovery")

3. SPECIFIC RECOMMENDATIONS (2-3 bullet points) for what to eat now or going forward today

Format your response EXACTLY like this:
SCORE: [number 0-100]
VERDICT: [one sentence]
RECOMMENDATIONS:
- [point 1]
- [point 2]
- [point 3 if needed]

Be specific with food suggestions and quantities. Use emojis sparingly for emphasis."""

    try:
        client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"Analyze my recovery nutrition after my {request.workout_type} ({request.workout_intensity} intensity) that ended {request.hours_since_workout} hours ago."
            }]
        )

        return {
            "analysis": response.content[0].text,
            "recovery_window_open": recovery_window_open,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))