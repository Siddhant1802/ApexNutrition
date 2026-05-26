from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, nutrition
from app.routers import auth, users, nutrition, athlete, food, meals


# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AthleteNutrition API",
    description="Sport-specific nutrition tracking for performance athletes",
    version="1.0.0"
)

# CORS middleware - allows mobile app and web to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["Nutrition"])
app.include_router(athlete.router, prefix="/api")
app.include_router(food.router, prefix="/api")
app.include_router(meals.router, prefix="/api")

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "AthleteNutrition API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}