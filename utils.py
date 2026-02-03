import os
from pathlib import Path
import pickle
from datetime import datetime
import csv
import cv2

# ---------- PATH HELPERS ----------
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
ENCODING_FILE = BASE_DIR / "encodings.pickle"
ATTENDANCE_FILE = BASE_DIR / "attendance.csv"

def ensure_dirs():
    DATASET_DIR.mkdir(exist_ok=True)

def save_face_image(name: str, img):
    person_dir = DATASET_DIR / name
    person_dir.mkdir(exist_ok=True)
    count = len(list(person_dir.glob("*.jpg"))) + 1
    filename = person_dir / f"{name}_{count:03}.jpg"
    cv2.imwrite(str(filename), img)
    return filename

# ---------- ENCODING HELPERS ----------
def load_encodings():
    if ENCODING_FILE.exists():
        with open(ENCODING_FILE, "rb") as f:
            return pickle.load(f)
    return {"encodings": [], "names": []}

def save_encodings(data: dict):
    with open(ENCODING_FILE, "wb") as f:
        pickle.dump(data, f)

# ---------- ATTENDANCE HELPERS ----------
def log_attendance(name: str):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    rows = []
    # Check if name already in file (update last_seen)
    if ATTENDANCE_FILE.exists():
        with open(ATTENDANCE_FILE, newline="") as f:
            rows = list(csv.reader(f))
    found = False
    for row in rows:
        if row[0] == name:
            row[2] = now        # update last_seen
            found = True
            break
    if not found:
        rows.append([name, now, now])  # name, first_seen, last_seen
    with open(ATTENDANCE_FILE, "w", newline="") as f:
        csv.writer(f).writerows(rows)
