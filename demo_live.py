import requests
import os
import json

BASE_URL = "http://127.0.0.1:8000"
TEST_IMG = "test_face.jpg"

def run_demo():
    print("--- LIVE SYSTEM DEMO ---")
    print(f"API URL: {BASE_URL}")
    print("------------------------")

    # 1. Register a Demo User
    print("\n1. Uploading User to Supabase...")
    if not os.path.exists(TEST_IMG):
         # Create a dummy image if missing
         with open(TEST_IMG, "wb") as f:
             f.write(os.urandom(1024))
    
    with open(TEST_IMG, "rb") as f:
        files = {"file": (TEST_IMG, f, "image/jpeg")}
        data = {"name": "Demo User", "department": "Showcase"}
        r = requests.post(f"{BASE_URL}/users/", data=data, files=files)
        
    if r.status_code == 200:
        user = r.json()
        print("✅ User Registered!")
        print(f"   Name: {user['name']}")
        print(f"   ID: {user['id']}")
        print(f"   Shape: Supabase Storage -> 'faces' bucket")
        print(f"   🔗 PROFILE IMAGE: {user['profile_image_url']}")
        user_id = user['id']
    else:
        print(f"❌ Registration Failed: {r.text}")
        return

    # 2. Log Attendance
    print("\n2. Logging Attendance (Simulating Camera)...")
    with open(TEST_IMG, "rb") as f:
        files = {"file": (TEST_IMG, f, "image/jpeg")}
        data = {"user_id": user_id}
        r = requests.post(f"{BASE_URL}/attendance/", data=data, files=files)
        
    if r.status_code == 200:
        log = r.json()
        print("✅ Attendance Logged!")
        print(f"   Time: {log['timestamp']}")
        print(f"   Shape: Supabase Storage -> 'logs' bucket")
        print(f"   🔗 EVIDENCE IMAGE: {log['screenshot_path']}")
    else:
        print(f"❌ Attendance Failed: {r.text}")

    print("\n------------------------")
    print("You can verify this data in your Supabase Dashboard now.")
    print(f"Go to Table Editor -> 'users' to see ID {user_id}")

if __name__ == "__main__":
    run_demo()
