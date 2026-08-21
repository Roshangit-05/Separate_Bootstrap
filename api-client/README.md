# Project 2 — TaskFlow Pro API Client Application

A clean, responsive web application built with **Python Flask**, **Bootstrap 5**, **Jinja2**, and **Requests** that consumes the Project 1 REST API.

---

## Key Architecture Rule
- **Zero Database Access**: This client application NEVER connects directly to SQLite or imports Project 1's models/database code.
- **Pure REST API Communication**: All authentication, task creation, editing, filtering, and deletion are handled strictly via HTTP REST requests to the Project 1 Backend API.
- **Centralized Helper**: All requests flow through `api_client.py` with automatic Bearer token injection, session handling, timeouts, and error handling.

---

## Features
- **Modern Bootstrap 5 Dashboard**: Summary metric cards (Total, Completed, Pending, In Progress), category tags, and responsive cards.
- **Complete Task Management**: Create, edit, toggle status, search by keywords, filter by category/status, delete with confirmation modal.
- **Session Authentication**: Secure JWT handling stored in server-side Flask session cookies (never exposed to raw client JS).
- **Graceful Error Trapping**: Handles network timeouts, 401 token expirations (redirects to login), 404s, and Render cold-start delays.

---

## Directory Structure
```text
api-client/
├── app.py               # Main Flask web application routes
├── api_client.py        # Centralized REST API client helper
├── config.py            # Configuration loader
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── templates/
│   ├── base.html        # Bootstrap 5 layout & navbar
│   ├── login.html       # Sign in page
│   ├── register.html    # Sign up page
│   ├── dashboard.html   # Main dashboard with task metrics & cards
│   ├── task.html        # Task detail and editor
│   └── profile.html     # User profile and statistics
└── static/
    ├── css/style.css    # Custom styles & card hover effects
    └── js/app.js        # Form UX & alert helpers
```

---

## Local Setup & Run

1. **Navigate to directory & create virtual environment**:
```bash
cd api-client
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure Environment Variables**:
```bash
cp .env.example .env
```
Edit `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5001
SECRET_KEY=generate-a-secure-random-client-secret-key-12345
API_BASE_URL=http://127.0.0.1:5000
API_TIMEOUT=15
```

4. **Start Client Application**:
```bash
python app.py
```
Open your browser at `http://127.0.0.1:5001`.

---

## Connecting to Deployed Render Backend

When Project 1 is deployed to Render:
1. Copy the production URL (e.g. `https://your-api.onrender.com`).
2. Update `.env` in Project 2:
   ```env
   API_BASE_URL=https://your-api.onrender.com
   ```
3. Restart Project 2:
   ```bash
   python app.py
   ```
Project 2 will now seamlessly communicate across the internet with your deployed Render REST API!
