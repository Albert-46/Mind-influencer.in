"""
routes_admin.py — Admin-only API endpoints for Mind Influencer Reviews.

All routes under /api/admin/... require a valid JWT passed as:
    Authorization: Bearer <token>

Endpoints:
  POST  /api/admin/login              — Authenticate and get a JWT
  GET   /api/admin/reviews            — List all reviews (incl. pending)
  PATCH /api/admin/reviews/<id>       — Approve / reject / add notes
  DELETE /api/admin/reviews/<id>      — Delete a review permanently
  POST  /api/admin/users              — Create a new admin user
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from models import Review, AdminUser, ALLOWED_COURSES
from auth import generate_token, require_admin

admin_bp = Blueprint("admin", __name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


# ── POST /api/admin/login ─────────────────────────────────────────────────────

@admin_bp.post("/api/admin/login")
def admin_login():
    """
    Authenticate an admin user and return a JWT.

    Body (JSON):
      email    : str  required
      password : str  required

    Returns:
      200  { "token": "...", "admin": { id, name, email } }
      400  Validation error
      401  Invalid credentials
    """
    data = request.get_json(silent=True)
    if not data:
        return _error("Request body must be valid JSON.")

    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return _error("email and password are required.")

    admin = AdminUser.query.filter_by(email=email).first()
    if not admin or not check_password_hash(admin.password_hash, password):
        # Deliberately vague to avoid email enumeration
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    token = generate_token(admin.id, admin.email)

    return jsonify({
        "success": True,
        "token":   token,
        "admin":   admin.to_dict(),
    }), 200


# ── GET /api/admin/reviews ────────────────────────────────────────────────────

@admin_bp.get("/api/admin/reviews")
@require_admin
def list_all_reviews():
    """
    Return all reviews (approved + pending), newest first.

    Query params:
      course      — filter by course
      is_approved — filter by approval status ("true"/"false")
      limit       — max results (default 100)
      offset      — pagination offset (default 0)

    Requires: Authorization: Bearer <token>
    """
    course      = request.args.get("course", "").strip() or None
    approved_q  = request.args.get("is_approved", "").strip().lower()
    limit       = min(int(request.args.get("limit",  100)), 200)
    offset      = max(int(request.args.get("offset",   0)),   0)

    query = Review.query
    if course:
        query = query.filter_by(course=course)
    if approved_q == "true":
        query = query.filter_by(is_approved=True)
    elif approved_q == "false":
        query = query.filter_by(is_approved=False)

    total   = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "reviews": [r.to_admin_dict() for r in reviews],
        "total":   total,
    }), 200


# ── PATCH /api/admin/reviews/<id> ─────────────────────────────────────────────

@admin_bp.patch("/api/admin/reviews/<int:review_id>")
@require_admin
def update_review(review_id: int):
    """
    Approve, reject, or add admin notes to a review.

    Body (JSON, all fields optional):
      is_approved : bool   — true to approve, false to reject/hide
      admin_notes : str    — internal note (not shown publicly), max 500 chars

    Returns:
      200  Updated review (admin dict)
      404  Review not found

    Requires: Authorization: Bearer <token>
    """
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "error": "Review not found."}), 404

    data = request.get_json(silent=True) or {}

    if "is_approved" in data:
        val = data["is_approved"]
        if not isinstance(val, bool):
            return _error("is_approved must be a boolean (true or false).")
        review.is_approved = val

    if "admin_notes" in data:
        notes = str(data["admin_notes"] or "").strip()
        if len(notes) > 500:
            return _error("admin_notes must be 500 characters or fewer.")
        review.admin_notes = notes or None

    db.session.commit()

    return jsonify({
        "success": True,
        "review":  review.to_admin_dict(),
    }), 200


# ── DELETE /api/admin/reviews/<id> ────────────────────────────────────────────

@admin_bp.delete("/api/admin/reviews/<int:review_id>")
@require_admin
def delete_review(review_id: int):
    """
    Permanently delete a review. This cannot be undone.

    Requires: Authorization: Bearer <token>
    """
    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"success": False, "message": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()

    return jsonify({"success": True, "message": "Review deleted"}), 200


# ── POST /api/admin/users ─────────────────────────────────────────────────────

@admin_bp.post("/api/admin/users")
@require_admin
def create_admin_user():
    """
    Create a new admin user.  Only existing admins can do this.

    Body (JSON):
      name     : str  required
      email    : str  required
      password : str  required, min 10 chars

    Requires: Authorization: Bearer <token>
    """
    data = request.get_json(silent=True)
    if not data:
        return _error("Request body must be valid JSON.")

    name     = (data.get("name")     or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not name or not email or not password:
        return _error("name, email, and password are all required.")
    if len(password) < 10:
        return _error("password must be at least 10 characters.")
    if AdminUser.query.filter_by(email=email).first():
        return _error(f"An admin with email {email!r} already exists.")

    new_admin = AdminUser(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        "success": True,
        "admin":   new_admin.to_dict(),
    }), 201
