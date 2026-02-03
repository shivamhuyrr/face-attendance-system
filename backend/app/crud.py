from sqlalchemy.orm import Session
from . import models, schemas
import pickle
import numpy as np

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate, encoding_bytes: bytes):
    # 1. Create User
    db_user = models.User(
        name=user.name, 
        department=user.department,
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
