from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to athlete profile
    profile = relationship("AthleteProfile", back_populates="user", uselist=False)


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    # Sport details
    primary_sport = Column(String)
    sport_category = Column(String)  # endurance, strength, team, combat, explosive
    position = Column(String, nullable=True)  # For team sports
    competition_level = Column(String)  # recreational, competitive, elite
    training_phase = Column(String)  # off_season, base, build, peak, competition
    
    # Body metrics
    weight_kg = Column(Float)
    height_cm = Column(Float)
    age = Column(Integer)
    gender = Column(String)
    
    # Goals
    primary_goal = Column(String)  # performance, muscle_gain, fat_loss
    
    # Calculated nutrition targets (updated by algorithm)
    bmr = Column(Integer, nullable=True)  # Basal Metabolic Rate
    tdee = Column(Integer, nullable=True)  # Total Daily Energy Expenditure
    
    # Training day targets
    training_day_calories = Column(Integer, nullable=True)
    training_day_protein_g = Column(Integer, nullable=True)
    training_day_carbs_g = Column(Integer, nullable=True)
    training_day_fat_g = Column(Integer, nullable=True)
    
    # Rest day targets
    rest_day_calories = Column(Integer, nullable=True)
    rest_day_protein_g = Column(Integer, nullable=True)
    rest_day_carbs_g = Column(Integer, nullable=True)
    rest_day_fat_g = Column(Integer, nullable=True)
    
    # Hydration
    base_hydration_ml = Column(Integer, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship back to user
    user = relationship("User", back_populates="profile")