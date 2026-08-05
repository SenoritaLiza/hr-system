from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://hrsystem:hrsystem@db:5432/hrsystem"
    cors_origins: list[str] = ["http://localhost:8080", "http://localhost:5183"]


settings = Settings()