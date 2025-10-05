from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://listify_user:listify_pass@localhost:5432/listify_db"
    
    # App
    APP_NAME: str = "Listify"
    DEBUG: bool = True
    
    # CORS - Lista de origins permitidos separados por coma
    CORS_ORIGINS: str = "http://localhost:4200,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()