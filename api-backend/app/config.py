"""
Application Configuration Module
Handles environment-based settings for development, testing, and production.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load variables from .env file if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    """Base configuration settings."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod-12345")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-in-prod-67890")
    
    # Token expiration in hours
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    
    # SQLite Database URI (Defaults to tasks_notes.db inside instance/ or root)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'tasks_notes.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")


class DevelopmentConfig(Config):
    """Development environment specific configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration for Render / Cloud hosting."""
    DEBUG = False
    
    # Handle Render postgres URL prefix fix (postgres:// vs postgresql://) if needed
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = db_url.replace("postgres://", "postgresql://", 1)


class TestingConfig(Config):
    """Testing configuration with in-memory database."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


# Map configuration names
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig
}
