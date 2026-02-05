# Entity Relationship Diagram (ERD)

This diagram represents the schema hosted on **Supabase PostgreSQL**.

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCE : "has many"
    
    USERS {
        int id PK "Primary Key, Auto Increment"
        string name "User's Full Name"
        string department "Department Name"
        string profile_image_url "URL to Supabase Storage 'faces' bucket"
        datetime created_at "Registration Time"
    }

    ATTENDANCE {
        int id PK "Primary Key, Auto Increment"
        int user_id FK "Foreign Key -> USERS.id"
        datetime timestamp "Time of Attendance"
        string screenshot_path "URL to Supabase Storage 'logs' bucket"
    }

    FACE_ENCODINGS {
        int id PK "Primary Key"
        int user_id FK "Foreign Key -> USERS.id"
        bytes encoding "128-d float array (serialized)"
    }
    
    USERS ||--|{ FACE_ENCODINGS : "has"
```

## Storage Architecture (Supabase Storage)

* **Bucket: `faces`**
  * **Purpose**: Stores reference photos of users.
  * **Access**: Public Read.
  * **Permissions**: Public Upload (via Policy).

* **Bucket: `logs`**
  * **Purpose**: Stores security screenshots / evidence of attendance.
  * **Access**: Public Read.
  * **Permissions**: Public Upload (via Policy).
