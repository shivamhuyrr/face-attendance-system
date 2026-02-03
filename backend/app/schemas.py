from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    user_id: int

class AttendanceCreate(AttendanceBase):
    pass 

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime
    screenshot_path: Optional[str] = None

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    department: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    pass # Encoding will be handled separately in the API endpoint via file upload

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FaceEncoding(BaseModel):
    id: int
    user_id: int
    # We still keep it as bytes/string in Pydantic for transport
    
    class Config:
        from_attributes = True

class UserWithEncodings(User):
    # This will return a list of objects, each having an 'encoding' field
    encodings: List[FaceEncoding] = []
