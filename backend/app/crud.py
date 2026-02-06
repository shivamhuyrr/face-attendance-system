from sqlalchemy.orm import Session
from . import models, schemas
import pickle
import numpy as np

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate, encoding_bytes: bytes):
    # 1. Create User
    db_user = models.User(
        name=user.name, 
        department=user.department, 
        email=user.email,
        roll_number=user.roll_number,
        role=user.role,
        profile_image_url=user.profile_image_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 2. Add Face Encoding
    db_encoding = models.FaceEncoding(
        user_id=db_user.id,
        encoding=encoding_bytes
    )
    db.add(db_encoding)
    db.commit()
    
    return db_user

def add_face_to_user(db: Session, user_id: int, encoding_bytes: bytes):
    db_encoding = models.FaceEncoding(
        user_id=user_id,
        encoding=encoding_bytes
    )
    db.add(db_encoding)
    db.commit()
    return db_encoding

def create_attendance(db: Session, user_id: int, screenshot_path: str = None):
    db_attendance = models.AttendanceLog(
        user_id=user_id,
        screenshot_path=screenshot_path
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AttendanceLog).offset(skip).limit(limit).all()


# --- Announcement CRUD ---
def create_announcement(db: Session, announcement: schemas.AnnouncementCreate):
    db_ann = models.Announcement(
        title=announcement.title,
        content=announcement.content,
        target_role=announcement.target_role
    )
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann

def get_announcements(db: Session, role: models.UserRole = None):
    """Get announcements for a specific role + public ones (role=None)"""
    query = db.query(models.Announcement)
    if role:
        # Fetch public announcements OR specific role announcements
        query = query.filter((models.Announcement.target_role == None) | (models.Announcement.target_role == role))
    else:
        # If no role specified (e.g. admin), show all? Or just public? 
        # For now, let's just show all for admin, public for others is better handled by filtered query.
        pass 
    return query.order_by(models.Announcement.created_at.desc()).all()

