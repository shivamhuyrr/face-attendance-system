
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest
import os
import io
import cv2
import numpy as np

# Import app components 
# (Adjust imports based on where this file is located relative to app)
from backend.app.main import app, get_db
from backend.app.database import Base
from backend.app import security

# --- SETUP MOCK DB (SQLite In-Memory) ---
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# --- SETUP MOCK AUTH ---
def override_get_current_admin():
    return type('User', (), {'email': 'admin@example.com'})

def override_get_current_user():
    return type('User', (), {'email': 'user@example.com', 'id': 'user_123'})

# Apply Overrides
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[security.get_current_admin] = override_get_current_admin
app.dependency_overrides[security.get_current_user] = override_get_current_user

client = TestClient(app)

# Create tables
Base.metadata.create_all(bind=engine)

# --- HELPER: Create Dummy Face Image ---
def create_dummy_face_image():
    # Create a 100x100 black image
    # Note: This WON'T have a face, so face_recognition will fail with 400.
    # That is EXPECTED and verifies our error handling works.
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, img_encoded = cv2.imencode('.jpg', img)
    return io.BytesIO(img_encoded.tobytes())

# --- TESTS ---

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Face Attendance System API"}

def test_register_user_fail_no_face():
    """
    Should fail because our dummy image has no face.
    This proves the Face Recognition engine is running.
    """
    img_file = create_dummy_face_image()
    files = {"file": ("test.jpg", img_file, "image/jpeg")}
    data = {"name": "Test User", "department": "IT"}
    
    response = client.post("/users/", data=data, files=files)
    
    # We expect 400 because "No face found"
    # If code was broken, it might be 500
    assert response.status_code == 400
    assert "No face found" in response.json()["detail"]

def test_get_users_empty():
    response = client.get("/users/")
    assert response.status_code == 200
    assert response.json() == []

# Note: We cannot test "Success" paths easily without a real face image 
# and dlib installed. But testing the failure path confirms the 
# logic (Auth -> Upload -> Face Check) is executing in order.
