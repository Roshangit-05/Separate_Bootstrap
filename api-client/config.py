"""
Client Application Configuration Module
Loads settings from environment variables for connecting to Project 1 REST API.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Flask client configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "client-dev-secret-session-key-98765")
    
    # Project 1 REST API Base URL (defaults to local backend port 5000)
    API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
    
    # Timeout in seconds for HTTP requests to backend
    API_TIMEOUT = int(os.getenv("API_TIMEOUT", 15))
    
    # Session cookie settings
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"
