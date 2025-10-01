from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://listify_user:listify_pass@localhost:5432/listify_db"
    
    # App
    APP_NAME: str = "Listify"
    DEBUG: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()