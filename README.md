# Enterprise Face Attendance System

A scalable, reliable, and secure face attendance system built with **FastAPI** (Backend) and **OpenCV/Face_Recognition** (Client). Designed for multi-camera environments and centralized data management.

## 🚀 Key Features

*   **Centralized Backend**: A robust REST API powered by FastAPI handling all user data and logs.
*   **Scalable Architecture**: Client-Server model allows multiple camera units ("Eyes") to sync with one central server ("Brain").
*   **Real-time Synchronization**: Camera units automatically fetch updated employee data on startup.
*   **Spam Prevention**: Intelligent client-side caching prevents duplicate attendance logs.
*   **Database**: SQLite integration (easily upgradeable to PostgreSQL) using SQLAlchemy.

## 🛠️ Tech Stack

*   **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn
*   **Client**: OpenCV, Face_Recognition, NumPy, Requests
*   **Database**: SQLite

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py       # API Entry point
│   │   ├── models.py     # Database Models
│   │   ├── schemas.py    # Pydantic Schemas
│   │   └── crud.py       # Database Operations
├── client/
│   ├── camera_runner.py  # Main Camera Script
│   └── client_utils.py   # API Communication Helpers
├── requirements.txt
└── README.md
```

## ⚡ Quick Start

### 1. Installation

```bash
pip install -r requirements.txt
```

### 2. Start the Backend Server

Open a terminal and run:

```bash
uvicorn backend.app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`. You can view the interactive API docs at `http://127.0.0.1:8000/docs`.

### 3. Register a User

Use the API docs (`/docs`) to test the `POST /users/` endpoint.
*   **Name**: Employee Name
*   **File**: Upload a clear photo of the employee's face.

The server will automatically detect the face, compute the encoding, and save it.

### 4. Start the Camera Client

Open a new terminal and run:

```bash
python client/camera_runner.py
```

The camera will open, sync with the server, and start logging attendance for recognized faces!

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License
