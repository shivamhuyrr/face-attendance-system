# Technology Stack

## 1. Frontend (The User Interface)

* **Framework**: **React** (v18+)
* **Build Tool**: **Vite** (Fast Development Server)
* **Language**: **TypeScript** (Ensure Type Safety)
* **Styling**: **Tailwind CSS** (Utility-First, Mobile Responsive)
* **Icons**: **Lucide React**
* **Purpose**: Provides the Admin Dashboard for registering users and viewing logs.

## 2. Backend (The Brain)

* **Framework**: **FastAPI** (Python)
* **Performance**: High-performance, async-ready (Uvicorn).
* **API Docs**: Auto-generated Swagger UI (`/docs`).
* **Purpose**:
  * Exposes REST endpoints.
  * Handles File Uploads.
  * Orchestrates Database & Storage operations.

## 3. Database & Storage (The Memory)

* **Provider**: **Supabase** (Open Source Firebase alternative).
* **Database**: **PostgreSQL** (Relational Data).
* **Object Storage**: **Supabase Storage** (S3-compatible) for Images.
* **Connection**: Direct Connection or Connection Pooler (PGBouncer) for reliability.

## 4. Computer Vision (The Eyes)

* **Library**: **face_recognition** (Python).
* **Core**: **dlib** (C++ Toolkit).
* **Processing**: **OpenCV** (cv2) for Image Manipulation.
* **Algorithm**: HOG (Histogram of Oriented Gradients) + CNN (Convolutional Neural Networks).
* **Flow**:
    1. Detect Face Location.
    2. Compute 128-d Encoding.
    3. calculate Euclidean Distance to find matches.

## 5. Deployment (Infrastructure)

* **Frontend**: **Vercel** (Global CDN).
* **Backend**: **Render** (Python Container).
* **Source Control**: **GitHub**.
