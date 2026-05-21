from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserResponse
from ..auth import get_current_user
from ..models import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.get("/test")
def test_users():
    """Test endpoint"""
    return {"message": "Users router working!"}