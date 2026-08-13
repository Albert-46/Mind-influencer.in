"""
app.py — Flask application factory for Mind Influencer Reviews Backend.

Usage:
  # 1. Install dependencies (first time only):
  #    pip install -r requirements.txt

  # 2. Initialise the database (first time only):
  #    python init_db.py

  # 3. Run the development server:
  #    flask --app app run --port 5001 --debug
  #    — or —
  #    python app.py

  # 4. Production (example with gunicorn):
  #    gunicorn "app:create_app()" --bind 0.0.0.0:5001 --workers 2
"""

from flask import Flask, jsonify
from config import config
from extensions import db, cors
from routes_public import public_bp
from routes_admin import admin_bp


def create_app(cfg=config) -> Flask:
    """Application factory — returns a configured Flask app."""
    app = Flask(__name__)

    # ── Load config ───────────────────────────────────────────────────────────
    app.config["SECRET_KEY"]                  = cfg.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"]     = cfg.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"]              = cfg.JWT_SECRET_KEY
    app.config["JWT_EXPIRY_HOURS"]            = cfg.JWT_EXPIRY_HOURS

    # ── Initialise extensions ─────────────────────────────────────────────────
    db.init_app(app)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cfg.CORS_ORIGINS}},
        supports_credentials=False,   # set True only if you use cookies
    )

    # ── Register blueprints ───────────────────────────────────────────────────
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"success": False, "error": "Internal server error."}), 500

    return app


# ── Direct execution ──────────────────────────────────────────────────────────
# Allows: python app.py
if __name__ == "__main__":
    app = create_app()
    app.run(port=5001, debug=config.DEBUG)
