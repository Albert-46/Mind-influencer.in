from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

ALLOWED_COURSES = ["IELTS", "OET", "Spoken English", "German"]


class ReviewBase(BaseModel):
    student_name: str = Field(..., min_length=2, max_length=100)
    course: str = Field(..., description="IELTS, OET, Spoken English, or German")
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=150)
    body: str = Field(..., min_length=10, max_length=2000)

    @field_validator("course")
    @classmethod
    def validate_course(cls, v: str) -> str:
        if v not in ALLOWED_COURSES:
            raise ValueError(f"Course must be one of: {', '.join(ALLOWED_COURSES)}")
        return v

    @field_validator("body")
    @classmethod
    def sanitize_body(cls, v: str) -> str:
        # Strip excessive whitespace
        return " ".join(v.split())


class ReviewCreate(ReviewBase):
    pass


class ReviewApprovalUpdate(BaseModel):
    """Body schema for admin PATCH endpoint."""
    is_approved: bool
    admin_note: Optional[str] = Field(None, max_length=500)


class ReviewResponse(ReviewBase):
    id: int
    is_approved: bool
    created_at: datetime
    admin_note: Optional[str] = None

    class Config:
        from_attributes = True
