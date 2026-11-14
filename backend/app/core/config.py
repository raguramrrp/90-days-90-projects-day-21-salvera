import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DEMO_DIR = DATA_DIR / "demo"
MODELS_DIR = BASE_DIR / "models"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "SALVERA"
    PROJECT_TITLE: str = "Technology Salary & Career Intelligence Platform"
    TAGLINE: str = "Understand your market value. Make smarter career moves."
    API_V1_STR: str = "/api"
    
    # Database URL: defaults to local SQLite for zero-friction setup, supports PostgreSQL seamlessly
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'salvera.db'}")
    
    DATA_DIR: Path = DATA_DIR
    DEMO_DIR: Path = DEMO_DIR
    MODELS_DIR: Path = MODELS_DIR
    
    # Normalization defaults
    DEFAULT_CURRENCY: str = "INR"
    USD_TO_INR_RATE: float = 83.5
    EUR_TO_INR_RATE: float = 90.0
    GBP_TO_INR_RATE: float = 106.0

settings = Settings()
