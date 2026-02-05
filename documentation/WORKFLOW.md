# System Workflow

## Overview

The Face Attendance System automates the process of recording user attendance using facial recognition. It bridges a local camera client, a cloud-based backend, and a web dashboard.

## 1. User Registration Flow

**Goal**: Add a new employee to the system.

1. **Admin** opens the **Web Dashboard** (React).
2. **Admin** fills in Name, Department, and uploads a **Profile Photo**.
3. **Frontend** sends this data to the **Backend API** (`POST /users/`).
4. **Backend** processing:
    * Uploads the photo to **Supabase Storage** (`faces` bucket).
    * Calculates the **Face Encoding** (128-dimensional vector) using `dlib`.
    * Saves User Details + Image URL + Encoding to **Supabase Database** (`users` table).
5. **Result**: The user is now "Known" by the system.

## 2. Attendance Marking Flow (Real-Time)

**Goal**: Mark attendance when an employee walks in front of the camera.

1. **Client Application** (Python + OpenCV) starts on a physical device (Laptop/CCTV).
2. **Sync**: Client fetches the list of all "Known Face Encodings" from the **Backend**.
3. **Detection**:
    * Client captures video frames in real-time.
    * Detects faces in the frame.
    * Compares detected face with "Known Encodings".
4. **Match Found**:
    * If a match is found (Distance < 0.5), it identifies the User ID.
    * **Cooldown**: Checks if the user was already logged in the last 60 seconds.
5. **Logging**:
    * Client sends a request to **Backend API** (`POST /attendance/`) with the User ID and the current Frame (Evidence).
6. **Backend** processing:
    * Uploads the Evidence Screenshot to **Supabase Storage** (`logs` bucket).
    * Inserts a record into **Supabase Database** (`attendance` table) with Timestamp and Image URL.

## 3. Monitoring & Reporting Flow

**Goal**: Admin views who is present.

1. **Admin** opens the **Web Dashboard**.
2. **Frontend** fetches the latest logs from **Supabase Database**.
3. **Display**: Shows a table with Names, Times, and a link to the "Evidence Photo" for verification.
