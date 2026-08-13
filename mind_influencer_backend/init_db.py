"""
init_db.py — One-time database initialisation script.

Run this ONCE before starting the server for the first time:
  python init_db.py

What it does:
  1. Creates all database tables (reviews, admin_users).
  2. Creates a default admin account (you MUST change the password after first login).

After running, the reviews.db SQLite file will appear in this folder.
"""

from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models import AdminUser

DEFAULT_ADMIN_EMAIL    = "admin@mindinfluencer.com"
DEFAULT_ADMIN_PASSWORD = "ChangeMe@2024!"   # ← Change this immediately!
DEFAULT_ADMIN_NAME     = "Mind Influencer Admin"


def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("[OK]  Database tables created.")

        # Create default admin if none exists
        if not AdminUser.query.first():
            admin = AdminUser(
                name=DEFAULT_ADMIN_NAME,
                email=DEFAULT_ADMIN_EMAIL,
                password_hash=generate_password_hash(DEFAULT_ADMIN_PASSWORD),
            )
            db.session.add(admin)
            db.session.commit()
            print(f"[OK]  Default admin created:")
            print(f"    Email   : {DEFAULT_ADMIN_EMAIL}")
            print(f"    Password: {DEFAULT_ADMIN_PASSWORD}")
            print()
            print("[!]   IMPORTANT: Log in and change this password immediately!")
        else:
            print("[i]   Admin user already exists - skipping creation.")


if __name__ == "__main__":
    init_db()
