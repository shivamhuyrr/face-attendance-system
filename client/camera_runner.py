import cv2
import face_recognition
import numpy as np
import time
from datetime import datetime, timedelta
import client_utils

def run_camera():
    # 1. Sync with Server
    print("[INFO] Syncing with server...")
    known_ids, known_encodings, known_names = client_utils.get_known_faces()
    print(f"[INFO] Loaded {len(known_names)} users.")
    
    video = cv2.VideoCapture(0)
    
    # Haarcascade for faster detection (optional, but good for pre-filtering)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    
    # Cooldown cache to prevent spamming the server
    # user_id -> last_logged_time
    attendance_cooldown = {}
    COOLDOWN_SECONDS = 60 # Only log once per minute per person
    
    print("[INFO] Starting Camera... Press 'q' to quit.")
    
    process_this_frame = True
    frame_count = 0
    
    while True:
        ret, frame = video.read()
        if not ret:
            break
            
        # Optimization: Process only every 3rd frame
        frame_count += 1
        if frame_count % 3 != 0:
            # Still display the frame, just don't re-process face recog
            # But we need to use 'face_locations' from previous frame to keep drawing boxes
            # For simplicity in this iteration, we just show the raw frame or 
            # we could cache the last known locations. 
            # Better UI approach: process every N frames, and linear interpolate or just hold rects.
            pass
        else:
            # Resize frame for faster processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            face_names = []
            
            for face_encoding in face_encodings:
                # Check for matches
                matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
                name = "Unknown"
                user_id = None
                
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_names[best_match_index]
                        user_id = known_ids[best_match_index]
                        
                        # Log Attendance if cooldown passed
                        now = datetime.now()
                        last_log = attendance_cooldown.get(user_id)
                        
                        if last_log is None or (now - last_log) > timedelta(seconds=COOLDOWN_SECONDS):
                            client_utils.log_attendance_to_server(user_id, frame)
                            attendance_cooldown[user_id] = now
                
                face_names.append(name)
            
        # Display results (UI Polish)
        # We need a fallback if face_locations isn't defined yet (first few frames)
        if 'face_locations' in locals():
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                # Scale back up
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4
                
                # Aesthetic Colors (Cyan/Blue for known, Red for Unknown)
                # Format: BGR
                box_color = (255, 191, 0) if name != "Unknown" else (0, 0, 255) # Deep Sky Blue or Red
                
                # Draw stylish corners instead of full box
                # cv2.rectangle(frame, (left, top), (right, bottom), box_color, 2)
                
                # Semi-transparent label background
                overlay = frame.copy()
                cv2.rectangle(overlay, (left, bottom - 40), (right, bottom), box_color, -1)
                alpha = 0.6
                cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
                
                # Clean outline
                cv2.rectangle(frame, (left, top), (right, bottom), box_color, 2)
                
                # Typography
                cv2.putText(frame, name.upper(), (left + 10, bottom - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
        cv2.imshow('Face Attendance Client', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    video.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_camera()
