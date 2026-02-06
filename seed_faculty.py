from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import pickle
import numpy as np
from backend.app import models, schemas, crud
from dotenv import load_dotenv

load_dotenv()

# Get DB URL
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./face_attendance.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_faculty():
    db = SessionLocal()
    try:
        # Check if faculty exists
        faculty = db.query(models.User).filter(models.User.email == "faculty@university.edu").first()
        if faculty:
            print("Faculty user already exists.")
            return

        print("Creating Faculty user...")
        # Create dummy encoding (128-d vector)
        dummy_encoding = np.random.rand(128)
        encoding_bytes = pickle.dumps(dummy_encoding)

        user_data = schemas.UserCreate(
            name="Dr. Severus Snape",
            email="faculty@university.edu",
            department="Potions",
            roll_number="FAC001",
            role=models.UserRole.FACULTY,
            profile_image_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Snape" # Placeholder
        )
        
        crud.create_user(db, user_data, encoding_bytes)
        print("Faculty user created successfully: faculty@university.edu")
        
    except Exception as e:
        print(f"Error seeding faculty: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_faculty()
