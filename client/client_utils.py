import requests
import pickle
import base64
import time

API_URL = "http://127.0.0.1:8000"

def get_known_faces():
    """
    Fetches all users from the backend and decodes their face encodings.
    Returns:
        ids (list): List of User IDs
        encodings (list): List of numpy arrays (face encodings)
        names (list): List of names
    """
    try:
        response = requests.get(f"{API_URL}/users/")
        response.raise_for_status()
        users = response.json()
        
        known_ids = []
        known_encodings = []
        known_names = []
        
        for user in users:
            # New structure: "encodings": [{"id":..., "encoding": "..."}]
            user_encodings = user.get("encodings", [])
            
            for face in user_encodings:
                if face.get("encoding"):
                    try:
                        # 1. Base64 decode
                        encoding_bytes = base64.b64decode(face["encoding"])
                        # 2. Unpickle
                        encoding_np = pickle.loads(encoding_bytes)
                        
                        known_ids.append(user["id"])
                        known_encodings.append(encoding_np)
                        known_names.append(user["name"])
                    except Exception as e:
                        print(f"Skipping bad encoding for user {user['id']}: {e}")
                
        return known_ids, known_encodings, known_names

    except Exception as e:
        print(f"[ERROR] Failed to sync with server: {e}")
        return [], [], []

import cv2

def log_attendance_to_server(user_id, frame=None):
    """
    Sends an attendance log to the backend.
    """
    try:
        data = {"user_id": user_id}
        files = None
        
        if frame is not None:
            # Encode frame to jpg
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                files = {"file": ("evidence.jpg", buffer.tobytes(), "image/jpeg")}
        
        response = requests.post(f"{API_URL}/attendance/", data=data, files=files)
        response.raise_for_status()
        print(f"[SUCCESS] Logged attendance for User ID: {user_id}")
    except Exception as e:
        print(f"[ERROR] Failed to log attendance: {e}")
