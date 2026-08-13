"""
config.py — Application configuration for Mind Influencer Reviews Backend.

Environment variables override defaults:
  FLASK_SECRET_KEY   — Flask session secret (change in production!)
  JWT_SECRET_KEY     — Secret used to sign admin JWTs (change in production!)
  DATABASE_URL       — SQLAlchemy DB URL (default: SQLite in this folder)
  ADMIN_API_KEY      — Optional simple API-key fallback for admin endpoints
  CORS_ORIGINS       — Comma-separated list of allowed frontend origins

To change to Postgres later, set:
  DATABASE_URL=postgresql://user:password@host:5432/mind_influencer
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    # ── Flask ────────────────────────────────────────────────────────────────
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    # ── Database ─────────────────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'reviews.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── JWT (admin auth) ─────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-me")
    # Token valid for 8 hours
    JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "8"))

    # ── CORS ─────────────────────────────────────────────────────────────────
    # In production set: CORS_ORIGINS=https://mindinfluencer.in,https://www.mindinfluencer.in
    CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "*")

    @property
    def CORS_ORIGINS(self):
        raw = self.CORS_ORIGINS_RAW
        if raw == "*":
            return "*"
        return [o.strip() for o in raw.split(",")]


config = Config()
