"""
Authentication Utilities and JWT Token Decorator
Implements secure stateless JWT token generation, verification, and route protection.
"""

from functools import wraps
from datetime import datetime, timedelta, timezone
import jwt
from flask import request, jsonify, current_app
from app.models import User


def generate_token(user_id: int, email: str) -> str:
    """
    Generate a cryptographically signed JWT access token.
    Payload contains user identifier, email, issued at, and expiration timestamps.
    """
    secret = current_app.config.get("JWT_SECRET_KEY")
    expires_hours = current_app.config.get("JWT_EXPIRES_HOURS", 24)
    
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    }
    
    token = jwt.encode(payload, secret, algorithm="HS256")
    # In PyJWT >= 2.0, jwt.encode returns a string
    return token if isinstance(token, str) else token.decode("utf-8")


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.
    """
    secret = current_app.config.get("JWT_SECRET_KEY")
    return jwt.decode(token, secret, algorithms=["HS256"])


def token_required(f):
    """
    Decorator to protect API routes with JWT Bearer authentication.
    Extracts 'Authorization: Bearer <token>', decodes it, and attaches current_user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        
        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization token is missing. Please provide 'Authorization: Bearer <token>'",
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
                return jsonify({
                    "success": False,
                    "message": "User associated with token no longer exists",
                    "error": "USER_NOT_FOUND"
                }), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Token has expired. Please log in again.",
                "error": "TOKEN_EXPIRED"
            }), 401
        except jwt.InvalidTokenError as e:
            return jsonify({
                "success": False,
                "message": f"Invalid token: {str(e)}",
                "error": "INVALID_TOKEN"
            }), 401
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authentication failed: {str(e)}",
                "error": "AUTH_FAILED"
            }), 401
            
        # Pass the authenticated user to the wrapped route handler
        return f(current_user, *args, **kwargs)
        
    return decorated
