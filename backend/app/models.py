from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    department = Column(String, index=True, nullable=True)
    profile_image_url = Column(String, nullable=True) # New: Profile picture URL from Supabase
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to multiple face encodings
    encodings = relationship("FaceEncoding", back_populates="user", cascade="all, delete-orphan")
    attendance_logs = relationship("AttendanceLog", back_populates="user", cascade="all, delete-orphan")

class FaceEncoding(Base):
    __tablename__ = "face_encodings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    encoding = Column(LargeBinary, nullable=False)
    
    user = relationship("User", back_populates="encodings")

class AttendanceLog(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    screenshot_path = Column(String, nullable=True) # New: Path to evidence image
    
    user = relationship("User", back_populates="attendance_logs")
