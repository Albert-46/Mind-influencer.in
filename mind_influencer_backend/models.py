"""
models.py — SQLAlchemy database models for Mind Influencer Reviews.

Tables:
  - reviews      : Student review submissions
  - admin_users  : Admin accounts that can approve/reject reviews
"""

from datetime import datetime
from extensions import db  # imported from extensions.py


# ── Review ────────────────────────────────────────────────────────────────────

ALLOWED_COURSES = ("IELTS", "OET", "Spoken English", "German")


class Review(db.Model):
    __tablename__ = "reviews"

    id            = db.Column(db.Integer, primary_key=True)
    student_name  = db.Column(db.String(100), nullable=False)
    course        = db.Column(db.String(50),  nullable=False)
    rating        = db.Column(db.Integer,     nullable=False)        # 1–5
    title         = db.Column(db.String(150), nullable=True)         # optional headline
    body          = db.Column(db.Text,        nullable=False)
    is_approved   = db.Column(db.Boolean,     nullable=False, default=False)
    admin_notes   = db.Column(db.String(500), nullable=True)         # internal only
    created_at    = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)

    def to_public_dict(self):
        """Fields returned to the public GET /api/reviews endpoint."""
        return {
            "id":           self.id,
            "student_name": self.student_name,
            "course":       self.course,
            "rating":       self.rating,
            "title":        self.title,
            "body":         self.body,
            "created_at":   self.created_at.isoformat() + "Z",
        }

    def to_admin_dict(self):
        """Full fields returned to admin endpoints."""
        return {
            **self.to_public_dict(),
            "is_approved": self.is_approved,
            "admin_notes": self.admin_notes,
        }

    def __repr__(self):
        return f"<Review #{self.id} by {self.student_name!r} [{self.course}] approved={self.is_approved}>"


# ── Admin User ────────────────────────────────────────────────────────────────

class AdminUser(db.Model):
    __tablename__ = "admin_users"

    id            = db.Column(db.Integer,     primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(200), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at    = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "created_at": self.created_at.isoformat() + "Z",
        }

    def __repr__(self):
        return f"<AdminUser #{self.id} {self.email!r}>"
