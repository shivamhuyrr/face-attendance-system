from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

# --- Constants ---
class UserRole(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"
    SUPPORT = "support"


# --- Announcement Schemas ---
class AnnouncementBase(BaseModel):
    title: str
    content: str
    target_role: Optional[UserRole] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class Announcement(AnnouncementBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    user_id: int

class AttendanceCreate(AttendanceBase):
    pass 

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime
    screenshot_path: Optional[str] = None
    status: str = "Present"

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    department: Optional[str] = None
    email: Optional[str] = None
    roll_number: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FaceEncoding(BaseModel):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class UserWithEncodings(User):
    encodings: List[FaceEncoding] = []
