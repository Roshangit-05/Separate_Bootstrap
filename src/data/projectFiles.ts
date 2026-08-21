import { CodeFile } from "../types";

export const PROJECT_1_FILES: CodeFile[] = [
  {
    path: "api-backend/app/__init__.py",
    name: "__init__.py",
    project: "backend",
    language: "python",
    description: "Flask application factory, database initialization, CORS configuration, blueprint registration, error handlers, and built-in interactive status UI.",
    content: `"""
Flask Application Factory
Initializes database, CORS, registers authentication and task blueprints,
registers global error handlers, and provides API test interface.
"""

import os
from flask import Flask, jsonify, render_template_string
from flask_cors import CORS
from app.config import config_by_name
from app.models import db


def create_app(config_name=None):
    """Factory function to configure and initialize the Flask application."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")
        
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))
    
    # Initialize Extensions
    db.init_app(app)
    
    # Configure Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
    
    # Ensure database tables exist and instance folder is present
    with app.app_context():
        os.makedirs(os.path.join(app.root_path, "..", "instance"), exist_ok=True)
        db.create_all()
        
    # Register API Blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    
    # Health Check Endpoint (Render uptime probe)
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Task & Notes REST API",
            "version": "1.0.0",
            "database": "connected"
        }), 200

    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad Request", "error": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource or endpoint not found", "error": "NOT_FOUND"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed on this endpoint", "error": "METHOD_NOT_ALLOWED"}), 405

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({"success": False, "message": "Internal server error occurred", "error": "INTERNAL_SERVER_ERROR"}), 500

    return app
`
  },
  {
    path: "api-backend/app/models.py",
    name: "models.py",
    project: "backend",
    language: "python",
    description: "SQLAlchemy database models for User and Task, with password hashing, UTC timestamps, JSON serialization, and 1-to-many relationship.",
    content: `"""
Database Models for Task & Notes Management API
Includes User and Task models with relationships and password hashing.
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User Model for registration, authentication, and task ownership."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # 1-to-Many Relationship: One User has many Tasks
    tasks = db.relationship(
        "Task", 
        backref="author", 
        lazy="dynamic", 
        cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        """Securely hash and store password using Werkzeug pbkdf2:sha256."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify provided password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_stats: bool = False) -> dict:
        """Serialize user object to dictionary (excluding sensitive password hash)."""
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_stats:
            data["total_tasks"] = self.tasks.count()
            data["completed_tasks"] = self.tasks.filter_by(status="completed").count()
            data["pending_tasks"] = self.tasks.filter(Task.status != "completed").count()
        return data

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}'>"


class Task(db.Model):
    """Task / Note Model owned by a specific User."""
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default="General", nullable=False, index=True)
    status = db.Column(db.String(30), default="pending", nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    def to_dict(self) -> dict:
        """Serialize task object to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description or "",
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self) -> str:
        return f"<Task id={self.id} user_id={self.user_id} title='{self.title[:20]}...'>"
`
  },
  {
    path: "api-backend/app/routes/auth.py",
    name: "auth.py",
    project: "backend",
    language: "python",
    description: "Endpoints for user registration, login with JWT token issuance, authenticated profile retrieval, and logout.",
    content: `"""
Authentication Routes
Endpoints:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/profile
  POST /api/auth/logout
"""

import re
from flask import Blueprint, request, jsonify
from app.models import db, User
from app.utils.auth import generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
EMAIL_REGEX = r"^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$"


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    
    errors = {}
    if not name or len(name) < 2:
        errors["name"] = "Name must be at least 2 characters."
    if not email or not re.match(EMAIL_REGEX, email):
        errors["email"] = "Valid email address is required."
    if not password or len(password) < 6:
        errors["password"] = "Password must be at least 6 characters."
        
    if errors:
        return jsonify({"success": False, "message": "Validation failed.", "errors": errors}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "message": "An account with this email already exists.",
            "error": "EMAIL_ALREADY_EXISTS"
        }), 400
        
    try:
        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        token = generate_token(new_user.id, new_user.email)
        return jsonify({
            "success": True,
            "message": "User account successfully created.",
            "data": {
                "token": token,
                "token_type": "Bearer",
                "user": new_user.to_dict()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return signed JWT token."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401
        
    token = generate_token(user.id, user.email)
    return jsonify({
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": token,
            "token_type": "Bearer",
            "user": user.to_dict(include_stats=True)
        }
    }), 200


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile(current_user):
    """Retrieve profile and stats for the authenticated user."""
    return jsonify({
        "success": True,
        "data": {
            "user": current_user.to_dict(include_stats=True)
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    """Informational logout endpoint for client session cleanup."""
    return jsonify({
        "success": True,
        "message": "Successfully logged out. Please discard token on client."
    }), 200
`
  },
  {
    path: "api-backend/app/routes/tasks.py",
    name: "tasks.py",
    project: "backend",
    language: "python",
    description: "CRUD, search, and filtering routes for user-owned tasks and notes, enforcing strict tenant isolation.",
    content: `"""
Tasks & Notes API Routes
Endpoints:
  GET    /api/tasks          - List all tasks for authenticated user
  POST   /api/tasks          - Create a new task/note
  GET    /api/tasks/<id>     - Get single task by ID (ownership strictly enforced)
  PUT    /api/tasks/<id>     - Update task (ownership strictly enforced)
  DELETE /api/tasks/<id>     - Delete task (ownership strictly enforced)
  GET    /api/tasks/search   - Search query across title & description
  GET    /api/tasks/filter   - Filter by status and/or category
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.models import db, Task
from app.utils.auth import token_required

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")
VALID_STATUSES = ["pending", "in_progress", "completed"]


@tasks_bp.route("", methods=["GET"])
@token_required
def get_all_tasks(current_user):
    """Get all tasks belonging to current user with metrics summary."""
    sort_order = request.args.get("sort", "created_desc")
    query = Task.query.filter_by(user_id=current_user.id)
    
    if sort_order == "created_asc":
        query = query.order_by(Task.created_at.asc())
    elif sort_order == "title_asc":
        query = query.order_by(Task.title.asc())
    elif sort_order == "status":
        query = query.order_by(Task.status.asc())
    else:
        query = query.order_by(Task.created_at.desc())
        
    tasks = query.all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    pending = sum(1 for t in tasks if t.status == "pending")
    in_prog = sum(1 for t in tasks if t.status == "in_progress")
    
    categories = {}
    for t in tasks:
        categories[t.category] = categories.get(t.category, 0) + 1
        
    return jsonify({
        "success": True,
        "count": total,
        "metrics": {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_prog,
            "categories": categories
        },
        "data": [task.to_dict() for task in tasks]
    }), 200


@tasks_bp.route("", methods=["POST"])
@token_required
def create_task(current_user):
    """Create a new task."""
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    category = (data.get("category") or "General").strip()
    status = (data.get("status") or "pending").strip().lower()
    
    if not title:
        return jsonify({"success": False, "message": "Task title is required."}), 400
    if status not in VALID_STATUSES:
        status = "pending"
        
    try:
        new_task = Task(
            user_id=current_user.id,
            title=title,
            description=description,
            category=category,
            status=status
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Task created successfully.",
            "data": new_task.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500


@tasks_bp.route("/<int:task_id>", methods=["GET"])
@token_required
def get_task(current_user, task_id):
    """Get single task by ID."""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found."}), 404
    if task.user_id != current_user.id:
        return jsonify({"success": False, "message": "Access denied. You do not own this task."}), 403
    return jsonify({"success": True, "data": task.to_dict()}), 200


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    """Update task attributes."""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found."}), 404
    if task.user_id != current_user.id:
        return jsonify({"success": False, "message": "Access denied."}), 403
        
    data = request.get_json(silent=True) or {}
    if "title" in data:
        t = (data.get("title") or "").strip()
        if not t:
            return jsonify({"success": False, "message": "Title cannot be empty."}), 400
        task.title = t
    if "description" in data:
        task.description = (data.get("description") or "").strip()
    if "category" in data:
        c = (data.get("category") or "").strip()
        if c:
            task.category = c
    if "status" in data:
        s = (data.get("status") or "").strip().lower()
        if s in VALID_STATUSES:
            task.status = s
            
    task.updated_at = datetime.now(timezone.utc)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Task updated successfully.", "data": task.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    """Delete a task."""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"success": False, "message": "Task not found."}), 404
    if task.user_id != current_user.id:
        return jsonify({"success": False, "message": "Access denied."}), 403
        
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({
            "success": True, 
            "message": f"Task '{task.title}' was successfully deleted.",
            "deleted_id": task_id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500


@tasks_bp.route("/search", methods=["GET"])
@token_required
def search_tasks(current_user):
    """Search user tasks by keyword in title and description."""
    q = (request.args.get("q") or "").strip()
    if not q:
        tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_at.desc()).all()
    else:
        pattern = f"%{q}%"
        tasks = Task.query.filter(
            Task.user_id == current_user.id,
            (Task.title.ilike(pattern) | Task.description.ilike(pattern))
        ).order_by(Task.created_at.desc()).all()
    return jsonify({"success": True, "query": q, "count": len(tasks), "data": [t.to_dict() for t in tasks]}), 200


@tasks_bp.route("/filter", methods=["GET"])
@token_required
def filter_tasks(current_user):
    """Filter user tasks by status and/or category."""
    status = request.args.get("status")
    category = request.args.get("category")
    
    query = Task.query.filter_by(user_id=current_user.id)
    if status and status in VALID_STATUSES:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
        
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify({
        "success": True,
        "filters_applied": {"status": status, "category": category},
        "count": len(tasks),
        "data": [t.to_dict() for t in tasks]
    }), 200
`
  },
  {
    path: "api-backend/app/utils/auth.py",
    name: "auth.py",
    project: "backend",
    language: "python",
    description: "JWT token generator, token decoding utility, and @token_required route decorator.",
    content: `"""
Authentication Utilities and JWT Token Decorator
"""

from functools import wraps
from datetime import datetime, timedelta, timezone
import jwt
from flask import request, jsonify, current_app
from app.models import User


def generate_token(user_id: int, email: str) -> str:
    """Generate a signed JWT access token valid for configured hours."""
    secret = current_app.config.get("JWT_SECRET_KEY")
    expires_hours = current_app.config.get("JWT_EXPIRES_HOURS", 24)
    
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token if isinstance(token, str) else token.decode("utf-8")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    secret = current_app.config.get("JWT_SECRET_KEY")
    return jwt.decode(token, secret, algorithms=["HS256"])


def token_required(f):
    """Decorator to protect API routes with JWT Bearer authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization token missing. Use 'Authorization: Bearer <token>'",
                "error": "UNAUTHORIZED"
            }), 401
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "message": "Invalid token header format. Expected 'Bearer <token>'",
                "error": "INVALID_TOKEN_FORMAT"
            }), 401
            
        token = parts[1]
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({"success": False, "message": "User not found."}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired. Please log in again.", "error": "TOKEN_EXPIRED"}), 401
        except Exception as e:
            return jsonify({"success": False, "message": f"Token invalid: {str(e)}", "error": "INVALID_TOKEN"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated
`
  },
  {
    path: "api-backend/app/config.py",
    name: "config.py",
    project: "backend",
    language: "python",
    description: "Environment configuration classes for development, testing, and production (Render).",
    content: `"""Application Configuration Module"""

import os
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod-12345")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-in-prod-67890")
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'tasks_notes.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig
}
`
  },
  {
    path: "api-backend/run.py",
    name: "run.py",
    project: "backend",
    language: "python",
    description: "Main server entrypoint for local execution and Render Gunicorn (gunicorn run:app).",
    content: `"""Project 1 - REST API Server Entrypoint"""

import os
from app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"🚀 Project 1: REST API Backend starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
`
  },
  {
    path: "api-backend/requirements.txt",
    name: "requirements.txt",
    project: "backend",
    language: "text",
    description: "Python package requirements for backend API.",
    content: `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
PyJWT==2.8.0
Werkzeug==3.0.1
python-dotenv==1.0.1
gunicorn==21.2.0
`
  },
  {
    path: "api-backend/.env.example",
    name: ".env.example",
    project: "backend",
    language: "env",
    description: "Backend environment variable template.",
    content: `FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
SECRET_KEY=your-super-secret-flask-key-12345
JWT_SECRET_KEY=your-jwt-secret-key-67890
JWT_ACCESS_TOKEN_EXPIRES_HOURS=24
DATABASE_URL=sqlite:///tasks_notes.db
CORS_ORIGINS=*
`
  },
  {
    path: "api-backend/.gitignore",
    name: ".gitignore",
    project: "backend",
    language: "text",
    description: "Git ignore rules preventing secrets and SQLite files from entering git.",
    content: `__pycache__/
*.py[cod]
.venv/
venv/
.env
instance/
*.db
*.sqlite
`
  }
];

export const PROJECT_2_FILES: CodeFile[] = [
  {
    path: "api-client/app.py",
    name: "app.py",
    project: "client",
    language: "python",
    description: "Flask web client with routes for user auth, session management, dashboard metrics, task creation, editing, status toggling, and profile.",
    content: `"""
Project 2 - REST API Client Web Application
Powered by Flask & Bootstrap 5.
Communicates strictly with Project 1 Backend via HTTP REST requests.
"""

from functools import wraps
import os
from flask import (
    Flask, render_template, request, redirect, 
    url_for, flash, session
)
from config import Config
from api_client import api

app = Flask(__name__)
app.config.from_object(Config)


def login_required(f):
    """Enforce authenticated session before accessing protected views."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "jwt_token" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


@app.context_processor
def inject_globals():
    return {
        "current_user": session.get("user"),
        "api_base_url": app.config.get("API_BASE_URL")
    }


@app.route("/")
def index():
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        if not email or not password:
            flash("Please enter both email and password.", "danger")
            return render_template("login.html", email=email)

        # Call Project 1 REST API POST /api/auth/login
        success, data, message, status = api.post("/api/auth/login", {
            "email": email,
            "password": password
        })

        if success and data and "token" in data:
            session["jwt_token"] = data["token"]
            session["user"] = data.get("user", {})
            flash("Welcome back! Login successful.", "success")
            return redirect(url_for("dashboard"))
        else:
            flash(message or "Invalid credentials.", "danger")
            return render_template("login.html", email=email)

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html", name=name, email=email)

        # Call Project 1 REST API POST /api/auth/register
        success, data, message, status = api.post("/api/auth/register", {
            "name": name,
            "email": email,
            "password": password
        })

        if success and data and "token" in data:
            session["jwt_token"] = data["token"]
            session["user"] = data.get("user", {})
            flash("Account successfully created!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash(message or "Registration failed.", "danger")
            return render_template("register.html", name=name, email=email)

    return render_template("register.html")


@app.route("/logout", methods=["GET", "POST"])
def logout():
    if "jwt_token" in session:
        api.post("/api/auth/logout")
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    search_query = request.args.get("q", "").strip()
    status_filter = request.args.get("status", "").strip()
    category_filter = request.args.get("category", "").strip()

    if search_query:
        success, res_data, message, status = api.get("/api/tasks/search", params={"q": search_query})
        tasks = res_data if isinstance(res_data, list) else []
        metrics = None
    elif status_filter or category_filter:
        params = {}
        if status_filter:
            params["status"] = status_filter
        if category_filter:
            params["category"] = category_filter
        success, res_data, message, status = api.get("/api/tasks/filter", params=params)
        tasks = res_data if isinstance(res_data, list) else []
        metrics = None
    else:
        success, res_data, message, status = api.get("/api/tasks")
        if success and isinstance(res_data, dict):
            tasks = res_data.get("data", [])
            metrics = res_data.get("metrics", {})
        elif isinstance(res_data, list):
            tasks = res_data
            metrics = None
        else:
            tasks = []
            metrics = None

    if not success and status == 401:
        session.clear()
        flash("Your session has expired. Please log in again.", "warning")
        return redirect(url_for("login"))

    if not success:
        flash(message, "danger")

    if not metrics:
        total = len(tasks)
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        pending = sum(1 for t in tasks if t.get("status") == "pending")
        in_prog = sum(1 for t in tasks if t.get("status") == "in_progress")
        categories = {}
        for t in tasks:
            c = t.get("category", "General")
            categories[c] = categories.get(c, 0) + 1
        metrics = {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_prog,
            "categories": categories
        }

    return render_template(
        "dashboard.html",
        tasks=tasks,
        metrics=metrics,
        search_query=search_query,
        status_filter=status_filter,
        category_filter=category_filter
    )


@app.route("/tasks/create", methods=["POST"])
@login_required
def create_task():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "General").strip()
    status = request.form.get("status", "pending").strip()

    if not title:
        flash("Task title cannot be empty.", "danger")
        return redirect(url_for("dashboard"))

    success, data, message, status_code = api.post("/api/tasks", {
        "title": title,
        "description": description,
        "category": category,
        "status": status
    })

    if success:
        flash("Task created successfully!", "success")
    else:
        flash(f"Failed to create task: {message}", "danger")

    return redirect(url_for("dashboard"))


@app.route("/tasks/<int:task_id>")
@login_required
def view_task(task_id):
    success, data, message, status_code = api.get(f"/api/tasks/{task_id}")
    if not success:
        flash(message, "danger")
        return redirect(url_for("dashboard"))
    return render_template("task.html", task=data)


@app.route("/tasks/<int:task_id>/edit", methods=["POST"])
@login_required
def edit_task(task_id):
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "General").strip()
    status = request.form.get("status", "pending").strip()

    success, data, message, status_code = api.put(f"/api/tasks/{task_id}", {
        "title": title,
        "description": description,
        "category": category,
        "status": status
    })

    if success:
        flash("Task updated successfully.", "success")
    else:
        flash(f"Update failed: {message}", "danger")

    return redirect(url_for("view_task", task_id=task_id))


@app.route("/tasks/<int:task_id>/toggle-status", methods=["POST"])
@login_required
def toggle_status(task_id):
    current_status = request.form.get("current_status", "pending")
    new_status = "completed" if current_status != "completed" else "pending"

    success, data, message, status_code = api.put(f"/api/tasks/{task_id}", {
        "status": new_status
    })

    if success:
        flash(f"Task marked as {new_status}.", "success")
    else:
        flash(f"Failed to update status: {message}", "danger")

    return redirect(request.referrer or url_for("dashboard"))


@app.route("/tasks/<int:task_id>/delete", methods=["POST"])
@login_required
def delete_task(task_id):
    success, data, message, status_code = api.delete(f"/api/tasks/{task_id}")
    if success:
        flash("Task deleted successfully.", "info")
    else:
        flash(f"Failed to delete task: {message}", "danger")
    return redirect(url_for("dashboard"))


@app.route("/profile")
@login_required
def profile():
    success, data, message, status_code = api.get("/api/auth/profile")
    user_data = session.get("user", {})
    if success and data and "user" in data:
        user_data = data["user"]
        session["user"] = user_data
    return render_template("profile.html", user=user_data)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"🚀 Project 2: API Client running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
`
  },
  {
    path: "api-client/api_client.py",
    name: "api_client.py",
    project: "client",
    language: "python",
    description: "Centralized REST API helper that performs HTTP calls to Project 1, manages Bearer tokens, timeouts, and friendly error handling.",
    content: `"""
Centralized REST API Client Helper
Handles all HTTP communication with Project 1 Backend API
"""

from typing import Optional, Dict, Any, Tuple
import requests
from flask import session, current_app


class RestApiClient:
    """Client helper for Project 1 REST API."""

    def __init__(self, base_url: Optional[str] = None, timeout: int = 15):
        self.base_url = (base_url or "").rstrip("/")
        self.timeout = timeout

    def _get_base_url(self) -> str:
        if self.base_url:
            return self.base_url
        return current_app.config.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")

    def _get_timeout(self) -> int:
        return current_app.config.get("API_TIMEOUT", self.timeout)

    def _get_headers(self, custom_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        token = session.get("jwt_token")
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if custom_headers:
            headers.update(custom_headers)
        return headers

    def _handle_response(self, response: requests.Response) -> Tuple[bool, Any, str, int]:
        status_code = response.status_code
        try:
            res_json = response.json()
        except ValueError:
            res_json = {}

        message = res_json.get("message", "")
        data = res_json.get("data", res_json)

        if 200 <= status_code < 300:
            return True, data, message or "Success", status_code
        elif status_code == 401:
            return False, data, message or "Session expired. Please log in again.", status_code
        elif status_code == 403:
            return False, data, message or "Access denied.", status_code
        elif status_code == 404:
            return False, data, message or "Resource not found.", status_code
        elif status_code == 400:
            errors = res_json.get("errors")
            if errors and isinstance(errors, dict):
                first_err = next(iter(errors.values()))
                return False, errors, first_err, status_code
            return False, data, message or "Invalid request data.", status_code
        else:
            return False, data, message or f"Backend error ({status_code}).", status_code

    def _request(
        self, 
        method: str, 
        endpoint: str, 
        json_data: Optional[Dict[str, Any]] = None, 
        params: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Any, str, int]:
        url = f"{self._get_base_url()}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        timeout = self._get_timeout()

        try:
            response = requests.request(
                method=method,
                url=url,
                json=json_data,
                params=params,
                headers=headers,
                timeout=timeout
            )
            return self._handle_response(response)

        except requests.exceptions.ConnectionError:
            return (
                False, 
                None, 
                "Cannot connect to the REST API backend. If hosted on Render, it may be waking up from cold-start. Please try again in a moment.",
                503
            )
        except requests.exceptions.Timeout:
            return (
                False, 
                None, 
                "Request timed out waiting for the REST API backend.",
                504
            )
        except requests.exceptions.RequestException as e:
            return (
                False, 
                None, 
                f"Network error: {str(e)}", 
                500
            )

    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None):
        return self._request("GET", endpoint, params=params)

    def post(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None):
        return self._request("POST", endpoint, json_data=json_data)

    def put(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None):
        return self._request("PUT", endpoint, json_data=json_data)

    def delete(self, endpoint: str):
        return self._request("DELETE", endpoint)


api = RestApiClient()
`
  },
  {
    path: "api-client/config.py",
    name: "config.py",
    project: "client",
    language: "python",
    description: "Configuration loader for Flask client and API_BASE_URL target.",
    content: `"""Client Application Configuration Module"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "client-dev-secret-session-key-98765")
    API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")
    API_TIMEOUT = int(os.getenv("API_TIMEOUT", 15))
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
`
  },
  {
    path: "api-client/templates/base.html",
    name: "base.html",
    project: "client",
    language: "html",
    description: "Base Jinja2 template with responsive Bootstrap 5 navigation, flash alerts, and layout structure.",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}TaskFlow Pro{% endblock %} - REST Client App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body class="d-flex flex-column min-vh-100 bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center fw-bold text-white" href="{{ url_for('dashboard' if current_user else 'login') }}">
                <span class="bg-primary text-white rounded-3 p-2 me-2 d-inline-flex align-items-center justify-content-center" style="width:34px; height:34px;">
                    <i class="bi bi-check2-square"></i>
                </span>
                TaskFlow
                <span class="badge bg-primary-subtle text-primary-emphasis ms-2 small fw-normal">Client App</span>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
                    {% if current_user %}
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('dashboard') }}"><i class="bi bi-grid-1x2 me-1"></i> Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('profile') }}"><i class="bi bi-person-circle me-1"></i> {{ current_user.name or 'Profile' }}</a>
                        </li>
                        <li class="nav-item ms-lg-2">
                            <a class="btn btn-outline-danger btn-sm px-3" href="{{ url_for('logout') }}"><i class="bi bi-box-arrow-right me-1"></i> Logout</a>
                        </li>
                    {% else %}
                        <li class="nav-item">
                            <a class="nav-link" href="{{ url_for('login') }}"><i class="bi bi-box-arrow-in-right me-1"></i> Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-primary btn-sm px-3 text-white" href="{{ url_for('register') }}"><i class="bi bi-person-plus me-1"></i> Register</a>
                        </li>
                    {% endif %}
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-3">
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category }} alert-dismissible fade show shadow-sm border-0" role="alert">
                        {{ message }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                {% endfor %}
            {% endif %}
        {% endwith %}
    </div>

    <main class="container py-4 flex-grow-1">
        {% block content %}{% endblock %}
    </main>

    <footer class="footer mt-auto py-3 bg-white border-top">
        <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
            <div><strong>Project 2</strong> — Flask & Bootstrap 5 REST Client</div>
            <div>Backend: <code class="text-primary">{{ api_base_url }}</code></div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ url_for('static', filename='js/app.js') }}"></script>
</body>
</html>
`
  },
  {
    path: "api-client/templates/dashboard.html",
    name: "dashboard.html",
    project: "client",
    language: "html",
    description: "Responsive dashboard featuring metric summary cards, search bar, category & status filters, task cards, and modals.",
    content: `{% extends "base.html" %}
{% block title %}Dashboard - TaskFlow Pro{% endblock %}

{% block content %}
<div class="row align-items-center mb-4">
    <div class="col-md-7">
        <h2 class="fw-bold text-dark mb-1">Welcome back, <span class="text-primary">{{ current_user.name if current_user else 'User' }}</span> 👋</h2>
        <p class="text-muted mb-0 small">All changes synchronize in real-time with Project 1 REST API.</p>
    </div>
    <div class="col-md-5 text-md-end mt-3 mt-md-0">
        <button type="button" class="btn btn-primary shadow-sm rounded-3 px-3 py-2 text-white" data-bs-toggle="modal" data-bs-target="#createTaskModal">
            <i class="bi bi-plus-lg me-1"></i> New Task / Note
        </button>
    </div>
</div>

<!-- Summary Metric Cards -->
<div class="row g-3 mb-4">
    <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span class="text-muted small fw-semibold text-uppercase">Total Tasks</span>
            <h3 class="fw-bold mb-0 text-dark">{{ metrics.total if metrics else tasks|length }}</h3>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span class="text-muted small fw-semibold text-uppercase">Completed</span>
            <h3 class="fw-bold mb-0 text-success">{{ metrics.completed if metrics else 0 }}</h3>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span class="text-muted small fw-semibold text-uppercase">Pending</span>
            <h3 class="fw-bold mb-0 text-warning-emphasis">{{ metrics.pending if metrics else 0 }}</h3>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span class="text-muted small fw-semibold text-uppercase">In Progress</span>
            <h3 class="fw-bold mb-0 text-info-emphasis">{{ metrics.in_progress if metrics else 0 }}</h3>
        </div>
    </div>
</div>

<!-- Search & Filters -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
    <form method="GET" action="{{ url_for('dashboard') }}" class="row g-2 align-items-center">
        <div class="col-12 col-md-5">
            <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control border-start-0" name="q" value="{{ search_query or '' }}" placeholder="Search tasks by title or notes...">
            </div>
        </div>
        <div class="col-6 col-md-3">
            <select class="form-select" name="status" onchange="this.form.submit()">
                <option value="">All Statuses</option>
                <option value="pending" {% if status_filter == 'pending' %}selected{% endif %}>Pending</option>
                <option value="in_progress" {% if status_filter == 'in_progress' %}selected{% endif %}>In Progress</option>
                <option value="completed" {% if status_filter == 'completed' %}selected{% endif %}>Completed</option>
            </select>
        </div>
        <div class="col-6 col-md-3">
            <select class="form-select" name="category" onchange="this.form.submit()">
                <option value="">All Categories</option>
                <option value="General" {% if category_filter == 'General' %}selected{% endif %}>General</option>
                <option value="Work" {% if category_filter == 'Work' %}selected{% endif %}>Work</option>
                <option value="Personal" {% if category_filter == 'Personal' %}selected{% endif %}>Personal</option>
                <option value="Study" {% if category_filter == 'Study' %}selected{% endif %}>Study</option>
            </select>
        </div>
        <div class="col-12 col-md-1 d-grid">
            <button type="submit" class="btn btn-dark"><i class="bi bi-funnel-fill"></i></button>
        </div>
    </form>
</div>

<!-- Task Cards Grid -->
<div class="row g-3">
    {% for task in tasks %}
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge bg-light text-secondary border">{{ task.category }}</span>
                    <span class="badge {% if task.status == 'completed' %}bg-success{% elif task.status == 'in_progress' %}bg-info text-dark{% else %}bg-warning text-dark{% endif %}">
                        {{ task.status }}
                    </span>
                </div>
                <h5 class="fw-bold mb-2">{{ task.title }}</h5>
                <p class="text-secondary small flex-grow-1">{{ task.description or 'No notes provided.' }}</p>
                <div class="border-top pt-2 d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ task.created_at[:10] if task.created_at else '' }}</small>
                    <div class="d-flex gap-1">
                        <form method="POST" action="{{ url_for('toggle_status', task_id=task.id) }}">
                            <input type="hidden" name="current_status" value="{{ task.status }}">
                            <button type="submit" class="btn btn-sm btn-outline-success"><i class="bi bi-check-lg"></i></button>
                        </form>
                        <a href="{{ url_for('view_task', task_id=task.id) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                    </div>
                </div>
            </div>
        </div>
    {% else %}
        <div class="col-12 text-center py-5">
            <p class="text-muted">No tasks found.</p>
        </div>
    {% endfor %}
</div>

<!-- Create Modal -->
<div class="modal fade" id="createTaskModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
            <form method="POST" action="{{ url_for('create_task') }}">
                <div class="modal-header border-0">
                    <h5 class="modal-title fw-bold">Create Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Title</label>
                        <input type="text" class="form-control" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Description</label>
                        <textarea class="form-control" name="description" rows="3"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-6 mb-3">
                            <label class="form-label small fw-semibold">Category</label>
                            <select class="form-select" name="category">
                                <option value="General">General</option>
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="Study">Study</option>
                            </select>
                        </div>
                        <div class="col-6 mb-3">
                            <label class="form-label small fw-semibold">Status</label>
                            <select class="form-select" name="status">
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary text-white">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    path: "api-client/requirements.txt",
    name: "requirements.txt",
    project: "client",
    language: "text",
    description: "Python package requirements for web client application.",
    content: `Flask==3.0.2
requests==2.31.0
python-dotenv==1.0.1
gunicorn==21.2.0
`
  },
  {
    path: "api-client/.env.example",
    name: ".env.example",
    project: "client",
    language: "env",
    description: "Client environment template with API_BASE_URL.",
    content: `FLASK_ENV=development
FLASK_DEBUG=True
PORT=5001
SECRET_KEY=generate-client-session-key-45678
API_BASE_URL=http://127.0.0.1:5000
API_TIMEOUT=15
`
  },
  {
    path: "api-client/.gitignore",
    name: ".gitignore",
    project: "client",
    language: "text",
    description: "Git ignore rules for client app.",
    content: `__pycache__/
*.py[cod]
.venv/
venv/
.env
`
  }
];

export const ALL_PROJECT_FILES: CodeFile[] = [...PROJECT_1_FILES, ...PROJECT_2_FILES];
