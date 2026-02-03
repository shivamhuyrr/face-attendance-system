import sys
import os

# Ensure we can import from the app package
# Assuming this script is run from the 'backend' directory
sys.path.append(os.getcwd())

try:
    from app import models, database
    print(f"Initializing database at: {database.SQLITE_URL}")
    models.Base.metadata.create_all(bind=database.engine)
    print("Database tables created successfully.")
except Exception as e:
    print(f"Error creating database: {e}")
    # Try alternate import if running from inside app (unlikely given the goal, but safe)
    try:
        from .app import models, database
        models.Base.metadata.create_all(bind=database.engine)
        print("Database tables created successfully (retry).")
    except Exception as e2:
        print(f"Retry failed: {e2}")
