from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, LargeBinary, Enum as SqlEnum, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"
    SUPPORT = "support"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, index=True, nullable=True)
    roll_number = Column(String, unique=True, index=True, nullable=True) # New: University ID
    role = Column(SqlEnum(UserRole), default=UserRole.STUDENT) # New: RBAC
    profile_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
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
    screenshot_path = Column(String, nullable=True)
    status = Column(String, default="Present") # New: e.g. Present, Late
    
    user = relationship("User", back_populates="attendance_logs")


class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    target_role = Column(SqlEnum(UserRole), nullable=True) # If null, for everyone
    created_at = Column(DateTime, default=datetime.utcnow)
