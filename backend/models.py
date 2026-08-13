from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(100), index=True, nullable=False)
    course = Column(String(50), index=True, nullable=False)
    rating = Column(Integer, nullable=False)
    title = Column(String(150), nullable=True)
    body = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    admin_note = Column(String(500), nullable=True)  # Internal note visible only to admins
    created_at = Column(DateTime(timezone=True), server_default=func.now())
