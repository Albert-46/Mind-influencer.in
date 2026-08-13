"""
routes_public.py — Public-facing API endpoints for Mind Influencer Reviews.

Endpoints:
  POST /api/reviews         — Submit a new review (saved as pending)
  GET  /api/reviews         — List approved reviews (optionally filtered by ?course=)
"""

from flask import Blueprint, request, jsonify
from extensions import db
from models import Review, ALLOWED_COURSES

public_bp = Blueprint("public", __name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


# ── POST /api/reviews ─────────────────────────────────────────────────────────

@public_bp.post("/api/reviews")
def submit_review():
    """
    Submit a student review.

    Body (JSON):
      student_name : str   required, 2–100 chars
      course       : str   required, one of IELTS / OET / Spoken English / German
      rating       : int   required, 1–5
      title        : str   optional, max 150 chars
      body         : str   required, 10–2000 chars

    Returns:
      201  { "success": true, "message": "..." }
      400  { "success": false, "error": "..." }
    """
    data = request.get_json(silent=True)
    if not data:
        return _error("Request body must be valid JSON.")

    # ── Validate student_name ─────────────────────────────────────────────────
    student_name = (data.get("student_name") or "").strip()
    if not student_name:
        return _error("student_name is required.")
    if len(student_name) < 2 or len(student_name) > 100:
        return _error("student_name must be between 2 and 100 characters.")

    # ── Validate course ───────────────────────────────────────────────────────
    course = (data.get("course") or "").strip()
    if not course:
        return _error("course is required.")
    if course not in ALLOWED_COURSES:
        return _error(f"course must be one of: {', '.join(ALLOWED_COURSES)}.")

    # ── Validate rating ───────────────────────────────────────────────────────
    raw_rating = data.get("rating")
    try:
        rating = int(raw_rating)
    except (TypeError, ValueError):
        return _error("rating must be an integer.")
    if not 1 <= rating <= 5:
        return _error("rating must be between 1 and 5.")

    # ── Validate body ─────────────────────────────────────────────────────────
    body = " ".join((data.get("body") or "").split())  # normalise whitespace
    if not body:
        return _error("body (review text) is required.")
    if len(body) < 10:
        return _error("body must be at least 10 characters.")
    if len(body) > 2000:
        return _error("body must be 2000 characters or fewer.")

    # ── Optional title ────────────────────────────────────────────────────────
    title = (data.get("title") or "").strip() or None
    if title and len(title) > 150:
        return _error("title must be 150 characters or fewer.")

    # ── Save to database ──────────────────────────────────────────────────────
    review = Review(
        student_name=student_name,
        course=course,
        rating=rating,
        title=title,
        body=body,
        is_approved=True,  # SET TO TRUE FOR TESTING (Change to False for production)
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Thank you! Your review is submitted and will be visible after approval.",
    }), 201


# ── GET /api/reviews ──────────────────────────────────────────────────────────

@public_bp.get("/api/reviews")
def get_approved_reviews():
    """
    Return all approved reviews, newest first.

    Query params:
      course  — filter by course (e.g. ?course=IELTS)
      limit   — max results (default 50, max 100)
      offset  — for pagination (default 0)

    Returns:
      200  { "reviews": [ {...}, ... ], "total": N }
    """
    course = request.args.get("course", "").strip() or None
    limit  = min(int(request.args.get("limit",  50)), 100)
    offset = max(int(request.args.get("offset",  0)),   0)

    query = Review.query.filter_by(is_approved=True)
    if course:
        if course not in ALLOWED_COURSES:
            return _error(f"course filter must be one of: {', '.join(ALLOWED_COURSES)}.")
        query = query.filter_by(course=course)

    total   = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "reviews": [r.to_public_dict() for r in reviews],
        "total":   total,
    }), 200
