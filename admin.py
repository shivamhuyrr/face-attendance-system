import requests
import os
import sys

BASE_URL = "http://127.0.0.1:8000"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    print("=========================================")
    print("   FACE ATTENDANCE SYSTEM - ADMIN TOOL   ")
    print("=========================================")

def view_users():
    try:
        response = requests.get(f"{BASE_URL}/users/")
        if response.status_code == 200:
            users = response.json()
            print(f"\n[INFO] Found {len(users)} users:\n")
            print(f"{'ID':<5} {'Name':<20} {'Dept':<15} {'Faces'}")
            print("-" * 50)
            for u in users:
                face_count = len(u.get("encodings", []))
                print(f"{u['id']:<5} {u['name']:<20} {str(u['department']):<15} {face_count}")
        else:
            print("[ERROR] Failed to fetch users.")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

def register_user():
    print("\n--- Register New User ---")
    name = input("Enter Name: ").strip()
    if not name:
        print("[ERROR] Name cannot be empty.")
        return

    dept = input("Enter Department (Optional): ").strip()
    
    path = input("Enter path to face image (e.g., C:/photos/john.jpg): ").strip()
    # Remove quotes if user dragged and dropped file
    if path.startswith('"') and path.endswith('"'):
        path = path[1:-1]
        
    if not os.path.exists(path):
        print(f"[ERROR] File not found: {path}")
        return

    try:
        print("[INFO] Uploading...")
        with open(path, "rb") as f:
            files = {"file": f}
            data = {"name": name, "department": dept}
            response = requests.post(f"{BASE_URL}/users/", data=data, files=files)
            
        if response.status_code == 200:
            user = response.json()
            print(f"[SUCCESS] User Registered! ID: {user['id']}")
        else:
            print(f"[ERROR] Server returned: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Failed: {e}")

def add_face():
    print("\n--- Add Face to Existing User ---")
    user_id = input("Enter User ID: ").strip()
    if not user_id.isdigit():
        print("[ERROR] Invalid ID.")
        return
        
    path = input("Enter path to NEW face image: ").strip()
    if path.startswith('"') and path.endswith('"'):
        path = path[1:-1]
        
    if not os.path.exists(path):
        print(f"[ERROR] File not found: {path}")
        return

    try:
        print("[INFO] Uploading...")
        with open(path, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{BASE_URL}/users/{user_id}/faces/", files=files)
            
        if response.status_code == 200:
            print(f"[SUCCESS] New face added to User {user_id}!")
        else:
            print(f"[ERROR] Server returned: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Failed: {e}")

def delete_user():
    print("\n--- Delete User ---")
    user_id = input("Enter User ID to DELETE: ").strip()
    if not user_id.isdigit():
        print("[ERROR] Invalid ID.")
        return
    
    confirm = input(f"Are you sure you want to delete User {user_id}? (y/n): ").lower()
    if confirm == 'y':
        try:
            response = requests.delete(f"{BASE_URL}/users/{user_id}")
            if response.status_code == 200:
                print("[SUCCESS] User deleted.")
            else:
                print(f"[ERROR] {response.text}")
        except Exception as e:
            print(f"[ERROR] {e}")

def reset_system():
    print("\n--- RESET SYSTEM ---")
    print("WARNING: This will delete ALL users and logs.")
    confirm = input("Type 'RESET' to confirm: ").strip()
    
    if confirm == 'RESET':
        try:
            response = requests.delete(f"{BASE_URL}/reset/")
            if response.status_code == 200:
                print("[SUCCESS] System Reset Complete.")
            else:
                print(f"[ERROR] {response.text}")
        except Exception as e:
            print(f"[ERROR] {e}")
    else:
        print("[INFO] Cancelled.")

def view_logs():
    try:
        response = requests.get(f"{BASE_URL}/attendance/")
        if response.status_code == 200:
            logs = response.json()
            print(f"\n[INFO] Found {len(logs)} logs:\n")
            print(f"{'Time':<25} {'User ID':<10} {'Screenshot'}")
            print("-" * 60)
            for log in logs:
                # Backend logs return fields based on schema, ensure schema has name? 
                # Currently schema: id, timestamp, screenshot_path
                # We might want to join with user name in future, but for now ID is fine.
                ts = log.get('timestamp', '')
                uid = log.get('user_id', '')
                shot = "Yes" if log.get('screenshot_path') else "No"
                print(f"{ts:<25} {uid:<10} {shot}")
        else:
            print("[ERROR] Failed to fetch logs.")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

def main_menu():
    while True:
        print("\n\n")
        print_header()
        print("1. View All Users")
        print("2. Register New User")
        print("3. Add Extra Photo to User")
        print("4. Delete User")
        print("5. RESET ALL DATA")
        print("6. View Attendance Logs")
        print("7. Exit")
        
        choice = input("\nEnter Choice (1-7): ").strip()
        
        if choice == '1':
            view_users()
        elif choice == '2':
            register_user()
        elif choice == '3':
            add_face()
        elif choice == '4':
            delete_user()
        elif choice == '5':
            reset_system()
        elif choice == '6':
            view_logs()
        elif choice == '7':
            print("Bye!")
            break
        else:
            print("Invalid choice.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main_menu()
