# Project 1 — Task & Notes REST API Backend

A production-ready REST API built with **Python**, **Flask**, **SQLite**, **Flask-SQLAlchemy**, **Flask-CORS**, and **PyJWT**.

---

## Features
- **Stateless Authentication**: JWT access token issuance, verification, and decoding.
- **Password Security**: Salted SHA-256 password hashing with Werkzeug.
- **Resource Ownership**: Strict tenant isolation (users can only view/edit/delete their own notes and tasks).
- **CRUD Operations**: Complete task management with categories, priority statuses, and timestamps.
- **Search & Filter**: Keyword search (`/search?q=...`) and status/category filtering (`/filter?status=...`).
- **Render Ready**: Configured for Gunicorn deployment with automated SQLite initialization.

---

## Technology Stack
- **Framework**: Flask 3.0.2
- **ORM & DB**: Flask-SQLAlchemy 3.1.1, SQLite
- **Authentication**: PyJWT 2.8.0, Werkzeug Security
- **CORS**: Flask-CORS 4.0.0
- **WSGI Server**: Gunicorn 21.2.0

---

## Directory Structure
```text
api-backend/
├── app/
│   ├── __init__.py      # App factory, CORS, blueprints, error handlers
│   ├── models.py        # User & Task SQLAlchemy models
│   ├── config.py        # Multi-environment configurations
│   ├── routes/
│   │   ├── auth.py      # /api/auth endpoints (register, login, profile, logout)
│   │   └── tasks.py     # /api/tasks CRUD, search & filter endpoints
│   └── utils/
│       └── auth.py      # JWT generator, validator & @token_required decorator
├── instance/            # SQLite database storage (git-ignored)
├── run.py               # Server entrypoint for local & Gunicorn
├── requirements.txt     # Production dependencies
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
└── README.md            # API documentation
```

---

## Database Schema

### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique user identifier |
| `name` | String(100) | Not Null | User's full name |
| `email` | String(120) | Unique, Not Null, Index | User's email (login credential) |
| `password_hash` | String(255) | Not Null | Securely hashed password |
| `created_at` | DateTime | Not Null, Default UTC | Account creation timestamp |

### `tasks` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique task identifier |
| `user_id` | Integer | Foreign Key (`users.id`), Index | Owner's user ID |
| `title` | String(200) | Not Null | Task title/summary |
| `description` | Text | Nullable | Task details / note content |
| `category` | String(50) | Not Null, Default 'General' | Tag (e.g., Work, Personal, Study) |
| `status` | String(30) | Not Null, Default 'pending' | `pending`, `in_progress`, `completed` |
| `created_at` | DateTime | Not Null, Default UTC | Creation timestamp |
| `updated_at` | DateTime | Not Null, Default UTC | Last update timestamp |

---

## API Endpoints Reference

### 1. Authentication Endpoints

#### `POST /api/auth/register`
Create a new user account.
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User account successfully created.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "created_at": "2026-08-21T02:20:00"
    }
  }
}
```

#### `POST /api/auth/login`
Authenticate user with email and password.
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "total_tasks": 5,
      "completed_tasks": 2,
      "pending_tasks": 3
    }
  }
}
```

#### `GET /api/auth/profile`
Retrieve authenticated user profile and task counters.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "total_tasks": 5,
      "completed_tasks": 2,
      "pending_tasks": 3,
      "created_at": "2026-08-21T02:20:00"
    }
  }
}
```

---

### 2. Task Management Endpoints

#### `GET /api/tasks`
Fetch all tasks owned by the authenticated user with status metrics.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?sort=created_desc` (or `created_asc`, `title_asc`, `status`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "metrics": {
    "total": 2,
    "completed": 1,
    "pending": 1,
    "in_progress": 0,
    "categories": { "Work": 1, "Personal": 1 }
  },
  "data": [
    {
      "id": 10,
      "user_id": 1,
      "title": "Complete quarterly review",
      "description": "Prepare spreadsheet and slide deck",
      "category": "Work",
      "status": "pending",
      "created_at": "2026-08-21T02:30:00",
      "updated_at": "2026-08-21T02:30:00"
    }
  ]
}
```

#### `POST /api/tasks`
Create a new task.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "title": "Finish API Documentation",
  "description": "Ensure cURL and JSON examples are fully documented",
  "category": "Work",
  "status": "in_progress"
}
```
- **Response (201 Created)**

#### `GET /api/tasks/<id>`
Get a single task by ID (returns 403 if belonging to another user).
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**

#### `PUT /api/tasks/<id>`
Update title, description, category, or status of a task.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "status": "completed",
  "category": "Work"
}
```
- **Response (200 OK)**

#### `DELETE /api/tasks/<id>`
Delete a task.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task was successfully deleted.",
  "deleted_id": 10
}
```

#### `GET /api/tasks/search?q=<keyword>`
Search task titles and descriptions.

#### `GET /api/tasks/filter?status=<status>&category=<category>`
Filter tasks by status (`pending`, `in_progress`, `completed`) and category (`Work`, `Personal`, etc.).

---

## Local Setup Instructions

1. **Clone repository and navigate to backend**:
```bash
git clone YOUR_REPO_URL
cd api-backend
```

2. **Create Python virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
cp .env.example .env
# Update SECRET_KEY and JWT_SECRET_KEY in .env if desired
```

5. **Start development server**:
```bash
python run.py
```
The API is now running at `http://127.0.0.1:5000`. Visit `http://127.0.0.1:5000/` in your browser to view the interactive status page.

---

## Render Deployment Guide

1. Push your code to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set **Root Directory**: `api-backend` (or root if repository is backend only).
5. Set **Environment**: `Python 3`.
6. Set **Build Command**: `pip install -r requirements.txt`.
7. Set **Start Command**: `gunicorn run:app`.
8. Add Environment Variables:
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: `<Generate random 32+ character string>`
   - `JWT_SECRET_KEY`: `<Generate random 32+ character string>`
   - `CORS_ORIGINS`: `*` (or your client domain)
9. Click **Deploy Web Service**.
10. Once deployed, test your API at `https://your-api.onrender.com/api/health`.
