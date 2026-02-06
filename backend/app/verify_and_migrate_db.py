from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Get DB URL
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./face_attendance.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

def run_migration():
    inspector = inspect(engine)
    
    # 1. Check if 'users' table exists
    if not inspector.has_table("users"):
        print("Table 'users' does not exist. It will be created by create_all().")
        return

    # 2. Get existing columns
    columns = [col['name'] for col in inspector.get_columns("users")]
    print(f"Existing 'users' columns: {columns}")

    with engine.connect() as conn:
        # 3. Add 'role' if missing
        if 'role' not in columns:
            print("Adding 'role' column...")
            try:
                if 'sqlite' in DATABASE_URL:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student'"))
                else:
                    # Postgres
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'student'"))
                conn.commit() # Important for some drivers
                print("Added 'role'.")
            except Exception as e:
                print(f"Failed to add 'role': {e}")

        # 4. Add 'roll_number' if missing
        if 'roll_number' not in columns:
            print("Adding 'roll_number' column...")
            try:
                if 'sqlite' in DATABASE_URL:
                    conn.execute(text("ALTER TABLE users ADD COLUMN roll_number VARCHAR"))
                else:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR"))
                conn.commit()
                print("Added 'roll_number'.")
            except Exception as e:
                print(f"Failed to add 'roll_number': {e}")
                
        # 5. Add 'email' if missing (it was added in previous session, but good to double check)

    # Check for new tables
    all_tables = inspector.get_table_names()
    print(f"All tables in DB: {all_tables}")
    
    expected_tables = ["idps", "idp_goals", "idp_reviews", "announcements"]
    for t in expected_tables:
        if t in all_tables:
            print(f"Verified table '{t}' exists.")
        else:
            print(f"WARNING: Table '{t}' MISSING. It should be created by the app startup.")


if __name__ == "__main__":
    run_migration()
