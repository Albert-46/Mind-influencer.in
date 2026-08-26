"""
Mind Influencer Reviews API  —  backend/main.py

Endpoints:
  Public:
    GET  /api/reviews                  — approved reviews only
    POST /api/reviews                  — submit a new review (pending moderation)
    GET  /healthz                      — health check (Render ping target)

  Admin (X-Api-Key header required):
    GET    /api/admin/reviews          — all reviews (pending + approved)
    PATCH  /api/admin/reviews/{id}     — approve / reject a review
    DELETE /api/admin/reviews/{id}     — permanently delete a review
"""

# Load .env for local development only — no-op if python-dotenv is not installed
# or if there is no .env file present.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import os
from fastapi import FastAPI, Depends, HTTPException, Request, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas
from .database import engine, get_db

# ── Tables ────────────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

# ── Admin API key ─────────────────────────────────────────────────────────────
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "change-me-in-production")

# Refuse to start in production (DATABASE_URL is set) with the default key.
# This prevents accidental deployment with an insecure credential.
if ADMIN_API_KEY == "change-me-in-production" and os.environ.get("DATABASE_URL"):
    raise RuntimeError(
        "\n\n"
        "  ✗  ADMIN_API_KEY is still set to the insecure default value.\n"
        "     Set a strong secret in Render's Environment Variables panel\n"
        "     before deploying to production.\n"
    )

# ── CORS origins ──────────────────────────────────────────────────────────────
# Comma-separated list from environment.
# Production default covers the primary domain, www variant, and Firebase preview.
# Local dev fallback covers the common dev-server ports.
_origins_env = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000",
)
ALLOWED_ORIGINS: List[str] = [o.strip() for o in _origins_env.split(",") if o.strip()]

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Mind Influencer Reviews API",
    description="API for student reviews on the Mind Influencer coaching platform.",
    version="1.1.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── Admin auth ────────────────────────────────────────────────────────────────
def verify_admin(x_api_key: Optional[str] = Header(None)) -> bool:
    if not x_api_key or x_api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
        )
    return True


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/healthz", include_in_schema=False)
def health_check():
    """Render health check target.  Returns 200 when the application is alive."""
    return {"status": "ok"}


# ── Public routes ─────────────────────────────────────────────────────────────

@app.post(
    "/api/reviews",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new student review (pending moderation)",
)
@limiter.limit("3/minute")
def submit_review(
    request: Request,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
):
    """
    Accept a new review.  The review is saved with **is_approved=False** and
    will not appear publicly until an admin approves it via the PATCH endpoint.

    Rate-limited to **3 submissions per minute** per IP address.
    """
    db_review = models.Review(
        student_name=review.student_name.strip(),
        course=review.course,
        rating=review.rating,
        title=review.title.strip() if review.title else None,
        body=review.body,
        is_approved=False,  # pending moderation
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return {
        "success": True,
        "message": "Thank you! Your review is pending approval.",
    }


@app.get(
    "/api/reviews",
    response_model=List[schemas.ReviewResponse],
    summary="List all approved reviews (public)",
)
def get_approved_reviews(
    course: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Returns all **approved** reviews, newest first.
    Optionally filter by **course** (IELTS | OET | Spoken English | German).
    Supports pagination via `skip` and `limit` (hard cap: 100).
    """
    if limit > 100:
        limit = 100

    query = db.query(models.Review).filter(models.Review.is_approved == True)  # noqa: E712
    if course:
        if course not in schemas.ALLOWED_COURSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid course. Must be one of: {', '.join(schemas.ALLOWED_COURSES)}",
            )
        query = query.filter(models.Review.course == course)

    reviews = query.order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews


# ── Admin routes ──────────────────────────────────────────────────────────────

@app.get(
    "/api/admin/reviews",
    response_model=List[schemas.ReviewResponse],
    summary="[Admin] List all reviews including pending",
)
def get_all_reviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin),
):
    """Returns all reviews (approved + pending), newest first. Requires admin API key."""
    reviews = (
        db.query(models.Review)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return reviews


@app.patch(
    "/api/admin/reviews/{review_id}",
    response_model=schemas.ReviewResponse,
    summary="[Admin] Approve or reject a review",
)
def update_review_approval(
    review_id: int,
    update: schemas.ReviewApprovalUpdate,
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin),
):
    """
    Approve or reject a review by toggling **is_approved**.
    Optionally attach an **admin_note** (internal only, never shown publicly).
    """
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    db_review.is_approved = update.is_approved
    if update.admin_note is not None:
        db_review.admin_note = update.admin_note.strip()

    db.commit()
    db.refresh(db_review)
    return db_review


@app.delete(
    "/api/admin/reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Permanently delete a review",
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin),
):
    """Permanently deletes a review.  This cannot be undone."""
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return None
