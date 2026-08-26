from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Database engine ───────────────────────────────────────────────────────────
# Production (Render): DATABASE_URL env var points to PostgreSQL.
# Local development:   Falls back to SQLite in the backend directory.
#
# Render's PostgreSQL connection strings start with "postgres://" but
# SQLAlchemy 1.4+ requires "postgresql://".  Fix that here.
_DATABASE_URL = os.environ.get("DATABASE_URL")

if _DATABASE_URL:
    if _DATABASE_URL.startswith("postgres://"):
        _DATABASE_URL = _DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(
        _DATABASE_URL,
        pool_pre_ping=True,   # recycle stale connections automatically
        pool_size=5,
        max_overflow=10,
    )
else:
    # Local dev — SQLite
    _SQLITE_PATH = os.path.join(BASE_DIR, "reviews.db")
    engine = create_engine(
        f"sqlite:///{_SQLITE_PATH}",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
