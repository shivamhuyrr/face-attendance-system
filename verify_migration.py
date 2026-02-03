import requests
import os
import sys

BASE_URL = "http://127.0.0.1:8000"
TEST_IMG = "test_face.jpg" # Will be in current dir after generation

def test_api():
    print(f"Checking API at {BASE_URL}...")
    try:
        r = requests.get(f"{BASE_URL}/")
        if r.status_code == 200:
            print("[PASS] API is reachable.")
        else:
            print(f"[FAIL] API returned {r.status_code}")
            return
    except Exception as e:
        print(f"[FAIL] Could not connect: {e}")
        return

    # 1. Register User
    print("\n[TEST] Registering User...")
    if not os.path.exists(TEST_IMG):
        print(f"[FAIL] Test image {TEST_IMG} not found.")
        return

    try:
        with open(TEST_IMG, "rb") as f:
            files = {"file": (TEST_IMG, f, "image/jpeg")}
            data = {"name": "Test User", "department": "QA"}
            r = requests.post(f"{BASE_URL}/users/", data=data, files=files)
            
        if r.status_code == 200:
            user = r.json()
            user_id = user["id"]
            print(f"[PASS] User registered. ID: {user_id}")
            print(f"       Image URL: {user.get('profile_image_url')}")
            
            if not user.get('profile_image_url'):
                print("[WARN] profile_image_url is empty! Storage upload might have failed.")
        else:
            print(f"[FAIL] Registration failed: {r.text}")
            return
    except Exception as e:
        print(f"[FAIL] Registration error: {e}")
        return

    # 2. Log Attendance
    print("\n[TEST] Logging Attendance...")
    try:
        with open(TEST_IMG, "rb") as f:
            files = {"file": (TEST_IMG, f, "image/jpeg")}
            data = {"user_id": user_id}
            r = requests.post(f"{BASE_URL}/attendance/", data=data, files=files)
            
        if r.status_code == 200:
            log = r.json()
            print(f"[PASS] Attendance logged. ID: {log['id']}")
            print(f"       Screenshot URL: {log.get('screenshot_path')}")
            
            if not log.get('screenshot_path'):
                print("[WARN] screenshot_path is empty! Log upload might have failed.")
        else:
            print(f"[FAIL] Attendance logging failed: {r.text}")
    except Exception as e:
        print(f"[FAIL] Attendance error: {e}")

    # 3. Clean up
    print("\n[TEST] Deleting User...")
    requests.delete(f"{BASE_URL}/users/{user_id}")
    print("[PASS] User deleted.")

if __name__ == "__main__":
    test_api()
