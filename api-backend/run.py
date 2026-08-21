"""
Project 1 - REST API Server Entrypoint
Usage:
  Local development: python run.py
  Production (Render): gunicorn run:app
"""

import os
from app import create_app

# Instantiate Flask application using environment or default configuration
app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"🚀 Project 1: REST API Backend starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
