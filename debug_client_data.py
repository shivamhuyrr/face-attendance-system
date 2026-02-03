import requests
import base64
import pickle
import numpy as np

BASE_URL = "http://127.0.0.1:8000"

def check_data():
    print("Fetching users from API...")
    try:
        r = requests.get(f"{BASE_URL}/users/")
        if r.status_code != 200:
            print(f"Error: {r.status_code}")
            print(r.text)
            return

        users = r.json()
        print(f"API returned {len(users)} users.")
        
        total_encodings = 0
        
        for u in users:
            name = u.get("name", "Unknown")
            encs = u.get("encodings", [])
            print(f"User ID {u['id']} ({name}): found {len(encs)} encodings.")
            
            for i, enc in enumerate(encs):
                try:
                    b64 = enc.get("encoding")
                    if not b64:
                        print(f"  - Encoding {i}: EMPTY")
                        continue
                        
                    data = base64.b64decode(b64)
                    np_arr = pickle.loads(data)
                    print(f"  - Encoding {i}: Valid Shape {np_arr.shape}")
                    total_encodings += 1
                except Exception as e:
                    print(f"  - Encoding {i}: ERROR {e}")
                    
        print(f"\nTotal usable encodings for client: {total_encodings}")
        
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    check_data()
