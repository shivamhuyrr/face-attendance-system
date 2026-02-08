# Enterprise Face Attendance System

A scalable, reliable, and secure face attendance system built with **FastAPI** (Backend) and **OpenCV/Face_Recognition** (Client). Designed for multi-camera environments and centralized data management.

## 🚀 Key Features

* **Centralized Backend**: A robust REST API powered by FastAPI handling all user data and logs.
* **Scalable Architecture**: Client-Server model allows multiple camera units ("Eyes") to sync with one central server ("Brain").
* **Real-time Synchronization**: Camera units automatically fetch updated employee data on startup.
* **Spam Prevention**: Intelligent client-side caching prevents duplicate attendance logs.
* **Database**: SQLite integration (easily upgradeable to PostgreSQL) using SQLAlchemy.

## 🛠️ Tech Stack

* **Backend**: Python 3.9, FastAPI, Uvicorn
* **Database**: Supabase (PostgreSQL)
* **Storage**: Supabase Storage (S3-compatible)
* **AI/ML**: `dlib`, `face_recognition`, `OpenCV` (Headless)
* **Infrastructure**: Docker, Docker Compose, Render (Cloud)

## 📂 Project Structure

```
├── backend/              # FastAPI Application (Dockerized)
│   ├── app/              # Source Code
│   └── Dockerfile        # Production Docker Config
├── frontend/             # React/Vite Application
├── documentation/        # Architecture & Flows
├── docker-compose.yml    # Local Orchestration
├── push_to_dockerhub.bat # Deployment Script
├── verify_deployment.py  # Health Check Script
```

## 📚 Detailed Documentation

* [**System Architecture**](documentation/SYSTEM_ARCHITECTURE.md): High-level overview of the system, including the problem statement and real-life impact.
* [**Workflow**](documentation/WORKFLOW.md): Step-by-step breakdown of user registration, attendance marking, and monitoring flows.
* [**ER Diagram**](documentation/ER_DIAGRAM.md): Visual representation of the database schema and relationships.
* [**Infrastructure Flow**](documentation/INFRASTRUCTURE_FLOW.md): detailed data flow between the client, server, and cloud services.
* [**Tech Stack**](documentation/TECH_STACK.md): In-depth look at the technologies used in the frontend, backend, and AI components.

## ⚡ Quick Start

### 1. Local Development (Docker)

The easiest way to run the entire stack (Backend + Frontend):

```bash
docker-compose up -d --build
```

This will start:

* Backend at `http://localhost:8000`
* Frontend at `http://localhost:5173`

### 2. Verify Health

Run the included Python script to ensure everything is connected:

```bash
python verify_deployment.py
```

## ☁️ Deployment

### 1. Push to Docker Hub

We build images locally to avoid memory issues on free cloud tiers.
Run the script and follow the prompts:

```bat
.\push_to_dockerhub.bat
```

### 2. Deploy to Render

The `render.yaml` file configures the service to pull your image from Docker Hub.

* Connect your repo to Render Blueprints.
* Add Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`.
* That's it!

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License
