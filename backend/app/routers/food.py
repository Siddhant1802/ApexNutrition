from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/food", tags=["food"])

USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

class FoodSearchResult(BaseModel):
    fdc_id: int
    description: str
    brand_owner: Optional[str] = None
    
class NutrientInfo(BaseModel):
    name: str
    amount: float
    unit: str

class FoodDetail(BaseModel):
    fdc_id: int
    description: str
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: float
    serving_unit: str

@router.get("/search")
async def search_food(query: str, page: int = 1):
    """Search for foods in USDA database"""
    
    if not USDA_API_KEY:
        raise HTTPException(status_code=500, detail="USDA API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{USDA_BASE_URL}/foods/search",
                params={
                    "api_key": USDA_API_KEY,
                    "query": query,
                    "pageSize": 10,
                    "pageNumber": page,
                    "dataType": ["Foundation", "SR Legacy"]
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="USDA API error")
            
            data = response.json()
            
            # Format results
            foods = []
            for food in data.get("foods", []):
                foods.append({
                    "fdc_id": food.get("fdcId"),
                    "description": food.get("description"),
                    "brand_owner": food.get("brandOwner"),
                })
            
            return {
                "foods": foods,
                "total": data.get("totalHits", 0)
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="USDA API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/details/{fdc_id}")
async def get_food_details(fdc_id: int):
    """Get detailed nutrition info for a specific food"""
    
    if not USDA_API_KEY:
        raise HTTPException(status_code=500, detail="USDA API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{USDA_BASE_URL}/food/{fdc_id}",
                params={"api_key": USDA_API_KEY},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Food not found")
            
            data = response.json()
            
            # Extract nutrition info
            nutrients = {}
            for nutrient in data.get("foodNutrients", []):
                name = nutrient.get("nutrient", {}).get("name", "").lower()
                amount = nutrient.get("amount", 0)
                
                if "energy" in name or "calorie" in name:
                    nutrients["calories"] = amount
                elif "protein" in name:
                    nutrients["protein"] = amount
                elif "carbohydrate" in name:
                    nutrients["carbs"] = amount
                elif "total lipid" in name or "fat, total" in name:
                    nutrients["fat"] = amount
            
            # Get serving size
            serving_size = 100  # Default to 100g
            serving_unit = "g"
            
            if data.get("servingSize"):
                serving_size = data.get("servingSize")
                serving_unit = data.get("servingSizeUnit", "g")
            
            return {
                "fdc_id": fdc_id,
                "description": data.get("description"),
                "calories": nutrients.get("calories", 0),
                "protein": nutrients.get("protein", 0),
                "carbs": nutrients.get("carbs", 0),
                "fat": nutrients.get("fat", 0),
                "serving_size": serving_size,
                "serving_unit": serving_unit
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="USDA API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))