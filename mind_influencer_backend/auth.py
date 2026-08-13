"""
auth.py — JWT helper utilities for admin authentication.

Tokens are signed HS256 JWTs with a short expiry (default 8 h).
Pass the token as:   Authorization: Bearer <token>
"""

import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app


def generate_token(admin_id: int, admin_email: str) -> str:
    """Create a signed JWT for an admin user."""
    expiry = datetime.now(tz=timezone.utc) + timedelta(
        hours=current_app.config["JWT_EXPIRY_HOURS"]
    )
    payload = {
        "sub":   str(admin_id),
        "email": admin_email,
        "exp":   expiry,
        "iat":   datetime.now(tz=timezone.utc),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure."""
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=["HS256"],
    )


def require_admin(f):
    """
    Decorator that protects a route with JWT admin auth.

    The client must send:
        Authorization: Bearer <token>

    On failure, returns 401 JSON.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or malformed."}), 401

        token = auth_header[len("Bearer "):]
        try:
            payload = decode_token(token)
            request.admin_id    = int(payload["sub"])
            request.admin_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.PyJWTError as exc:
            return jsonify({"error": f"Invalid token: {exc}"}), 401

        return f(*args, **kwargs)
    return decorated
