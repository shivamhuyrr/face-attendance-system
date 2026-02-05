# Infrastructure & Data Flow

This document explains how the 4 main pillars of our "Zero Cost" architecture talk to each other.

```mermaid
graph TD
    User((User Devices))
    subgraph "Frontend Layer"
        Vercel["React App (Vercel)"]
    end
    
    subgraph "Backend Layer"
        Render["Python API (Render)"]
    end
    
    subgraph "Data Layer"
        SupabaseDB[("Supabase DB")]
        SupabaseAuth["Supabase Auth"]
        SupabaseStorage["Supabase Storage"]
    end
    
    subgraph "Build System"
        DockerHub["Docker Hub"]
        Laptop["Your Laptop"]
    end

    %% Flow Connections
    User -->|1. Visits URL| Vercel
    Vercel -->|2. API Requests (JSON)| Render
    Render -->|3. Validate Token| SupabaseAuth
    Render -->|4. Store/Fetch Data| SupabaseDB
    Render -->|5. Save Images| SupabaseStorage
    
    %% Build Flow
    Laptop -.->|Build & Push| DockerHub
    DockerHub -.->|Pull Image| Render
```

## How It Works (Step-by-Step)

### 1. The Build Phase (One-Time Setup)

This happens **before** any user visits the site.

1. **Your Laptop**: You write code and run `docker build`. This creates a package containing Python, OpenCV, and your code.
2. **Docker Hub**: You push this package to Docker Hub (like uploading a video to YouTube).
3. **Render**: Render asks Docker Hub, "give me the latest package," downloads it, and runs it. Now your Backend is alive.

### 2. The User Login Flow

1. **User**: Opens the website on their phone.
2. **Vercel**: Sends the React website files to the phone.
3. **User**: Enters Username/Password.
4. **Vercel (Frontend)**: Sends these credentials directly to **Supabase Auth**.
5. **Supabase**: Checks if they are correct and gives the Frontend a digital "Access Badge" (Token).

### 3. The Attendance Flow

1. **User**: Clicks "Mark Attendance".
2. **Vercel**: Takes a photo and sends it + the "Access Badge" to **Render**.
3. **Render**:
    * Checks the badge with **Supabase**.
    * Uses **OpenCV** (inside the container) to find faces.
    * Uploads the evidence photo to **Supabase Storage**.
    * Saves the log entry to **Supabase Database**.
4. **Render**: Tells **Vercel** "Success!".
5. **Vercel**: Shows the **Green Tick**.
