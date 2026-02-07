import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine
from app.models import User, AttendanceLog, FaceEncoding, Announcement

def rebuild_database():
    print("⚠️  WARNING: This will DROP ALL TABLES and recreate them.")
    confirm = input("Are you sure? (y/N): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database rebuilt successfully.")

if __name__ == "__main__":
    rebuild_database()
