import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str = "development"
    llm_provider: str = "openai_compatible"
    llm_model: str = "openai/gpt-oss-120b"
    llm_max_tokens: int = 2048
    openai_api_key: str = ""
    openai_base_url: str = "https://api.groq.com/openai/v1"
    faiss_index_path: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "vectorstore" / "index.faiss")
    faiss_metadata_path: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "vectorstore" / "metadata.json")
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_credentials_path: str = ""
    firebase_database_url: str = ""
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
    temp_upload_dir: str = "" # Deprecated - kept for .env backwards compatibility
    max_file_size_mb: int = 20

    @property
    def cors_origins_list(self):
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
