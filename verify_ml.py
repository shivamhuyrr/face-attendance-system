import face_recognition
import cv2
import numpy as np
import os
import time

def verify_ml_core():
    print("🧠 INSPECTING ML CORE...")
    
    # 1. Check Libraries
    print(f"   [+] face_recognition version: {face_recognition.__version__}")
    print(f"   [+] numpy version: {np.__version__}")
    try:
        import dlib
        print(f"   [+] dlib version: {dlib.__version__}")
        print(f"   [+] dlib compiled with CUDA: {dlib.DLIB_USE_CUDA}")
    except ImportError:
        print("   [!] dlib not directly importable (used internally by face_recognition)")

    # 2. Create Dummy Data if needed
    img_path = "test_face.jpg"
    if not os.path.exists(img_path):
        print(f"\n   [!] '{img_path}' not found. Creating a synthetic test image...")
        # Create a blank image with a "face-like" structure (circles) just to have a valid file, 
        # though it won't be detected as a face.
        img = np.zeros((500, 500, 3), dtype="uint8")
        cv2.circle(img, (250, 250), 100, (255, 255, 255), -1) # Face
        cv2.circle(img, (220, 220), 10, (0, 0, 0), -1)       # Eye
        cv2.circle(img, (280, 220), 10, (0, 0, 0), -1)       # Eye
        cv2.ellipse(img, (250, 300), (40, 20), 0, 0, 180, (0, 0, 0), 2) # Mouth
        cv2.imwrite(img_path, img)
        print("   [+] Synthetic image created. (Note: May not be detected as a real face by ML model)")

    # 3. Perform Detection
    print(f"\n   [.] Loading image '{img_path}'...")
    start_time = time.time()
    image = face_recognition.load_image_file(img_path)
    
    print("   [.] Detecting faces (HOG model)...")
    face_locations = face_recognition.face_locations(image)
    detection_time = time.time() - start_time
    
    print(f"   [✓] Detection complete in {detection_time:.4f}s")
    print(f"   [✓] Faces found: {len(face_locations)}")

    if len(face_locations) > 0:
        for i, face_location in enumerate(face_locations):
            top, right, bottom, left = face_location
            print(f"       Face #{i+1} Location: Top: {top}, Left: {left}, Bottom: {bottom}, Right: {right}")

        # 4. Generate Encodings
        print("\n   [.] Generating 128-d Face Encodings...")
        start_time = time.time()
        face_encodings = face_recognition.face_encodings(image, face_locations)
        encoding_time = time.time() - start_time
        
        print(f"   [✓] Encoding complete in {encoding_time:.4f}s")
        
        for i, encoding in enumerate(face_encodings):
            print(f"       Face #{i+1} Vector Sample: {encoding[:5]}... (Length: {len(encoding)})")
            
        print("\n✅ CORE ML LOGIC IS OPERATIONAL.")
    else:
        print("\n⚠️  No faces detected in the test image.")
        print("   This is expected if using the synthetic drawing.")
        print("   To test real ML, replace 'test_face.jpg' with a real photo.")

if __name__ == "__main__":
    verify_ml_core()
