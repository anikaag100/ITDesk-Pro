import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise IT Support & Incident Resolver"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database Configuration (SQLite default with PostgreSQL support)
    DATABASE_URL: Optional[str] = "sqlite:///./it_resolver.db"

    # Security
    SECRET_KEY: str = "development_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def get_database_url(self) -> str:
        if not self.DATABASE_URL or not self.DATABASE_URL.strip():
            return "sqlite:///./it_resolver.db"
        return self.DATABASE_URL


settings = Settings()
