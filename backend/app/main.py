from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import face_recognition
import pickle
import numpy as np
from pathlib import Path
import base64
from datetime import datetime

from . import models, schemas, crud, database, security
from .supabase_client import supabase # New: Import Supabase client
import mimetypes

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Face Attendance System API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development (or specific frontend URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEBUGGING HANDLER ---
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )
# -------------------------

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Face Attendance System API"}

@app.post("/users/", response_model=schemas.User)
async def register_user(
    name: str = Form(...),
    department: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user = Depends(security.get_current_admin)
):
    # 1. Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 2. Load image and get encoding
        image = face_recognition.load_image_file(temp_filename)
        encodings = face_recognition.face_encodings(image)
        
        if len(encodings) == 0:
            raise HTTPException(status_code=400, detail="No face found in the image.")
        if len(encodings) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces found. Please upload a photo with a single face.")
            
        # 3. Serialize encoding
        encoding_bytes = pickle.dumps(encodings[0])

        # NEW: Upload to Supabase Storage
        public_url = None
        try:
            # Re-read file from temp path
            with open(temp_filename, "rb") as f:
                file_bytes = f.read()
            
            # Create unique filename
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '_')).rstrip().replace(' ', '_')
            file_ext = os.path.splitext(file.filename)[1]
            storage_path = f"{safe_name}_{timestamp}{file_ext}"
            
            # Upload
            supabase.storage.from_("faces").upload(storage_path, file_bytes, {"content-type": file.content_type})
            public_url = supabase.storage.from_("faces").get_public_url(storage_path)
        except Exception as e:
            print(f"Supabase Upload Failed: {e}")
        
        # 4. Create user in DB
        user_data = schemas.UserCreate(name=name, department=department, profile_image_url=public_url)
        return crud.create_user(db=db, user=user_data, encoding_bytes=encoding_bytes)
    
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/users/{user_id}/faces/", response_model=schemas.FaceEncoding)
async def add_face_to_user(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user = Depends(security.get_current_admin)
):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        image = face_recognition.load_image_file(temp_filename)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) == 0:
            raise HTTPException(status_code=400, detail="No face found.")
            
        encoding_bytes = pickle.dumps(encodings[0])
        return crud.add_face_to_user(db=db, user_id=user_id, encoding_bytes=encoding_bytes)
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin_user = Depends(security.get_current_admin)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted."}

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, name: str = Form(None), department: str = Form(None), db: Session = Depends(get_db), admin_user = Depends(security.get_current_admin)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if name:
        user.name = name
    if department:
        user.department = department
        
    db.commit()
    db.refresh(user)
    return user

@app.get("/users/")
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    results = []
    
    for u in users:
        u_dict = {
            "id": u.id,
            "name": u.name,
            "department": u.department,
            "profile_image_url": u.profile_image_url, # NEW: Include image URL
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "encodings": [] # NEW: List of encodings
        }
        
        # Serialize all face encodings for this user
        for face in u.encodings:
            try:
                enc_data = face.encoding
                if isinstance(enc_data, str):
                    enc_data = enc_data.encode('utf-8')
                    
                u_dict["encodings"].append({
                    "id": face.id,
                    "encoding": base64.b64encode(enc_data).decode('utf-8')
                })
            except Exception as e:
                print(f"Error encoding face {face.id}: {e}")
                
        results.append(u_dict)
    return results

@app.post("/attendance/", response_model=schemas.Attendance)
def log_attendance(
    user_id: int = Form(...), 
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user) # AUTHENTICATED USERS ONLY
):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    screenshot_path = None
    if file:
        # Save temp file first
        temp_filename = f"temp_log_{user_id}_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        try:
            # Upload to Supabase
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            file_ext = os.path.splitext(file.filename)[1]
            storage_path = f"{user_id}_{timestamp}{file_ext}"
            
            with open(temp_filename, "rb") as f:
                file_bytes = f.read()
                
            supabase.storage.from_("logs").upload(storage_path, file_bytes, {"content-type": file.content_type})
            screenshot_path = supabase.storage.from_("logs").get_public_url(storage_path)
            
        except Exception as e:
            print(f"Supabase Log Upload Failed: {e}")
            
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    return crud.create_attendance(db=db, user_id=user_id, screenshot_path=screenshot_path)

@app.get("/attendance/", response_model=List[schemas.Attendance])
def read_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_attendance_logs(db, skip=skip, limit=limit)

@app.delete("/reset/")
def reset_database(db: Session = Depends(get_db), admin_user = Depends(security.get_current_admin)):
    """
    DANGER: Deletes all users and attendance logs.
    """
    try:
        db.query(models.AttendanceLog).delete()
        db.query(models.User).delete()
        db.commit()
        return {"message": "All data has been reset."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
