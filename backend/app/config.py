from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "dev-secret-change-in-production"
    database_url: str = "sqlite+aiosqlite:///./skillsmarket.db"
    upload_dir: str = "./uploads/skills"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    max_upload_size_mb: int = 5
    max_extract_files: int = 100

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


settings = Settings()
