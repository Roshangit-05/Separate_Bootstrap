"""
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

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user account.
    Expects JSON: { "name": "...", "email": "...", "password": "..." }
    """
    data = request.get_json(silent=True) or {}
    
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    
    # Input Validation
    errors = {}
    if not name:
        errors["name"] = "Name is required."
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters."
        
    if not email:
        errors["email"] = "Email address is required."
    elif not re.match(EMAIL_REGEX, email):
        errors["email"] = "Please provide a valid email address."
        
    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 6:
        errors["password"] = "Password must be at least 6 characters long."
        
    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "errors": errors
        }), 400
        
    # Check if email is already registered
    if User.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "message": "An account with this email address already exists.",
            "error": "EMAIL_ALREADY_EXISTS"
        }), 400
        
    try:
        # Create and persist new user
        new_user = User(name=name, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate initial JWT token
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
        return jsonify({
            "success": False,
            "message": f"Failed to create user: {str(e)}",
            "error": "INTERNAL_SERVER_ERROR"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return a signed JWT token.
    Expects JSON: { "email": "...", "password": "..." }
    """
    data = request.get_json(silent=True) or {}
    
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    
    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Both email and password are required.",
            "error": "MISSING_CREDENTIALS"
        }), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password.",
            "error": "INVALID_CREDENTIALS"
        }), 401
        
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
    """
    Retrieve profile details and statistics for the currently authenticated user.
    Protected route - requires valid JWT.
    """
    return jsonify({
        "success": True,
        "data": {
            "user": current_user.to_dict(include_stats=True)
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    """
    Informational endpoint for client logout.
    Since JWT is stateless, the client should discard the token from memory/session.
    """
    return jsonify({
        "success": True,
        "message": "Successfully logged out. Please remove the stored token on client.",
        "user_id": current_user.id
    }), 200
