import { GuideStep } from "../types";

export const TWELVE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: "Create Project 1 (REST API Backend) Locally",
    subtitle: "Initialize workspace directory, virtual environment, and install dependencies",
    targetProject: "Project 1 (Backend)",
    explanation: "Set up the modular Flask backend architecture with Flask-SQLAlchemy, Flask-CORS, PyJWT, and Werkzeug. Organize your project into the recommended modular directory hierarchy.",
    commands: [
      "mkdir -p api-backend/app/routes api-backend/app/utils api-backend/instance",
      "cd api-backend",
      "python3 -m venv venv",
      "source venv/bin/activate  # On Windows: venv\\Scripts\\activate",
      "pip install -r requirements.txt"
    ],
    keyFiles: ["requirements.txt", "app/__init__.py", "app/config.py", "run.py"],
    checkpoints: [
      "Virtual environment created and activated (`(venv)` shown in prompt)",
      "All dependencies installed from requirements.txt without conflicts",
      "Directory structure matches `api-backend/app/`"
    ],
    tips: [
      "Always activate the virtual environment before installing packages or running scripts.",
      "Verify python version is Python 3.9+ (`python3 --version`)."
    ]
  },
  {
    step: 2,
    title: "Configure Environment & Create SQLite Database",
    subtitle: "Generate secrets, configure .env, and initialize database tables",
    targetProject: "Project 1 (Backend)",
    explanation: "Create your `.env` file from `.env.example`. When the Flask app context runs, `db.create_all()` creates the SQLite `instance/tasks_notes.db` file with User and Task tables.",
    commands: [
      "cp .env.example .env",
      "# (Optional) Edit .env with custom SECRET_KEY and JWT_SECRET_KEY",
      "python -c 'from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print(\"✅ Database tables created successfully!\")'"
    ],
    keyFiles: [".env.example", ".env", "app/models.py"],
    checkpoints: [
      ".env created with secure SECRET_KEY and JWT_SECRET_KEY",
      "Database initialized in `instance/tasks_notes.db`",
      "Tables `users` and `tasks` created with foreign keys and indexes"
    ],
    tips: [
      "Do NOT commit `.env` or `instance/tasks_notes.db` to Git (they are ignored in `.gitignore`).",
      "Use strong random keys for JWT signature security."
    ]
  },
  {
    step: 3,
    title: "Run & Test the REST API Locally",
    subtitle: "Launch local backend on port 5000 and verify endpoints with cURL",
    targetProject: "Project 1 (Backend)",
    explanation: "Start the Flask development server on `http://127.0.0.1:5000`. Test the health check, register a user, and fetch tasks using cURL or your browser.",
    commands: [
      "python run.py",
      "# In a separate terminal:",
      "# 1. Test Health probe",
      "curl -X GET http://127.0.0.1:5000/api/health",
      "# 2. Register a new user & extract JWT token",
      "curl -X POST http://127.0.0.1:5000/api/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Alex\",\"email\":\"alex@example.com\",\"password\":\"secret123\"}'"
    ],
    keyFiles: ["run.py", "app/routes/auth.py", "app/routes/tasks.py"],
    checkpoints: [
      "Server outputs: `Project 1: REST API Backend starting on http://127.0.0.1:5000`",
      "Visiting `http://127.0.0.1:5000/` in browser loads the built-in API tester page",
      "`/api/auth/register` returns HTTP 201 with JWT token in `data.token`"
    ]
  },
  {
    step: 4,
    title: "Prepare & Push Project 1 to GitHub",
    subtitle: "Initialize Git repository, verify .gitignore, and push to GitHub",
    targetProject: "Project 1 (Backend)",
    explanation: "Set up version control for the backend. Ensure sensitive files like `.env` and `instance/*.db` are excluded.",
    commands: [
      "cd api-backend",
      "git init",
      "git add .",
      "git status  # Ensure .env and *.db are NOT listed!",
      "git commit -m 'feat: Complete Project 1 REST API Backend with Flask, SQLite & JWT'",
      "git branch -M main",
      "git remote add origin https://github.com/YOUR_USERNAME/task-api-backend.git",
      "git push -u origin main"
    ],
    keyFiles: [".gitignore", "README.md"],
    checkpoints: [
      "Repository pushed to GitHub with clean commit history",
      "No `.env` or `.db` files present in the GitHub repository"
    ],
    tips: [
      "Never push passwords or API secrets to public repositories.",
      "If you accidentally committed `.env`, remove it with `git rm --cached .env`."
    ]
  },
  {
    step: 5,
    title: "Deploy Project 1 to Render",
    subtitle: "Provision a free Web Service on Render with Gunicorn start command",
    targetProject: "Project 1 (Backend)",
    explanation: "Deploy the REST API to Render as a Web Service. Render builds the Python environment from `requirements.txt` and executes `gunicorn run:app`.",
    commands: [
      "# Render Configuration Parameters:",
      "Build Command:  pip install -r requirements.txt",
      "Start Command:  gunicorn run:app",
      "Environment:    Python 3",
      "Root Directory: api-backend (if mono-repo) or root"
    ],
    keyFiles: ["requirements.txt", "run.py"],
    checkpoints: [
      "Render Web Service created and linked to GitHub repository",
      "Environment Variables configured on Render Dashboard:",
      "  - FLASK_ENV = production",
      "  - SECRET_KEY = <generated_secret>",
      "  - JWT_SECRET_KEY = <generated_secret>",
      "  - CORS_ORIGINS = *"
    ],
    tips: [
      "Render free tier services spin down after 15 minutes of inactivity; the first request takes ~30-50s to wake up.",
      "Check the Render 'Logs' tab to ensure Gunicorn booted on port 10000/3000 successfully."
    ]
  },
  {
    step: 6,
    title: "Test the Production Deployed API",
    subtitle: "Verify live endpoints at https://your-api.onrender.com",
    targetProject: "Project 1 (Backend)",
    explanation: "Test the live cloud API endpoints across the internet before connecting Project 2.",
    commands: [
      "# Replace https://your-api.onrender.com with your actual Render service URL:",
      "curl -X GET https://your-api.onrender.com/api/health",
      "# Test user registration on production",
      "curl -X POST https://your-api.onrender.com/api/auth/register \\",
      "  -H 'Content-Type: application/json' \\",
      "  -d '{\"name\":\"Cloud User\",\"email\":\"cloud@example.com\",\"password\":\"securepass123\"}'"
    ],
    keyFiles: ["app/routes/auth.py"],
    checkpoints: [
      "`/api/health` returns status: 'healthy'",
      "Registration returns a valid JWT Bearer token on production",
      "Copy your live URL: `https://your-api.onrender.com` for Step 8"
    ]
  },
  {
    step: 7,
    title: "Create Project 2 (API Client Application)",
    subtitle: "Set up separate client directory, templates, static assets, and api_client.py",
    targetProject: "Project 2 (Client)",
    explanation: "Initialize the independent Project 2 client. Note that Project 2 has NO database dependency and communicates ONLY via HTTP REST to Project 1.",
    commands: [
      "mkdir -p api-client/templates api-client/static/css api-client/static/js",
      "cd api-client",
      "python3 -m venv venv",
      "source venv/bin/activate  # On Windows: venv\\Scripts\\activate",
      "pip install -r requirements.txt"
    ],
    keyFiles: ["requirements.txt", "app.py", "api_client.py", "templates/base.html"],
    checkpoints: [
      "Project 2 installed in its own separate directory `api-client/`",
      "Dependencies installed: Flask, requests, python-dotenv, gunicorn",
      "Templates and static folders ready"
    ]
  },
  {
    step: 8,
    title: "Configure Project 2 with Render API URL",
    subtitle: "Set API_BASE_URL in Project 2's .env file",
    targetProject: "Project 2 (Client)",
    explanation: "Point the centralized `api_client.py` to the deployed backend (or local backend during dev).",
    commands: [
      "cp .env.example .env",
      "# For Local Testing (if Project 1 is on port 5000):",
      "# API_BASE_URL=http://127.0.0.1:5000",
      "# For Production Testing (Render URL from Step 6):",
      "# API_BASE_URL=https://your-api.onrender.com"
    ],
    keyFiles: [".env.example", ".env", "config.py", "api_client.py"],
    checkpoints: [
      "`API_BASE_URL` defined in `.env`",
      "`SECRET_KEY` set for client session cookie encryption",
      "`API_TIMEOUT=15` set to comfortably accommodate Render wake-ups"
    ]
  },
  {
    step: 9,
    title: "Run Project 2 Locally",
    subtitle: "Launch client frontend server on port 5001",
    targetProject: "Project 2 (Client)",
    explanation: "Start the Flask client app. It runs on port 5001 so it doesn't conflict with Project 1 (port 5000).",
    commands: [
      "python app.py",
      "# Output will show:",
      "# 🚀 Project 2: API Client Application starting on http://127.0.0.1:5001",
      "# 🔗 Target REST API Backend: https://your-api.onrender.com"
    ],
    keyFiles: ["app.py"],
    checkpoints: [
      "Client boots on `http://127.0.0.1:5001`",
      "Browser opens login page automatically redirecting from `/`"
    ]
  },
  {
    step: 10,
    title: "Test Complete End-to-End User Journey",
    subtitle: "Verify registration, login, JWT session, dashboard metrics, CRUD, and filters",
    targetProject: "Deployment & Integration",
    explanation: "Perform a full functional test of all user features from the Bootstrap 5 web interface.",
    commands: [
      "# Flow to verify in browser at http://127.0.0.1:5001:",
      "1. Click 'Register' -> Create account -> Auto-login with received JWT",
      "2. View Dashboard -> Verify summary metrics (Total, Completed, Pending, In Progress)",
      "3. Click 'New Task / Note' -> Add task with category 'Work' and status 'Pending'",
      "4. Toggle status to 'Completed' -> Watch metric counters update immediately",
      "5. Use search bar (`?q=...`) and category dropdown filter",
      "6. Click 'Edit Task' -> Modify title and notes -> Save",
      "7. Delete task with modal confirmation",
      "8. Visit 'Profile' page -> Verify user stats and token status",
      "9. Logout -> Confirm session is cleared and protected routes redirect"
    ],
    keyFiles: ["templates/dashboard.html", "templates/task.html", "templates/profile.html"],
    checkpoints: [
      "Every action executes via HTTP REST requests to Project 1",
      "No database files created or touched in `api-client` directory",
      "User isolation works (register second user and verify data is isolated)"
    ]
  },
  {
    step: 11,
    title: "Push Project 2 to GitHub",
    subtitle: "Commit and push the client application to its own repository",
    targetProject: "Project 2 (Client)",
    explanation: "Publish the client codebase to GitHub for tracking and cloud deployment.",
    commands: [
      "cd api-client",
      "git init",
      "git add .",
      "git commit -m 'feat: Complete Project 2 Flask & Bootstrap 5 REST Client'",
      "git branch -M main",
      "git remote add origin https://github.com/YOUR_USERNAME/task-api-client.git",
      "git push -u origin main"
    ],
    keyFiles: [".gitignore", "README.md"],
    checkpoints: [
      "Repository pushed to GitHub",
      "Clean separation maintained between Backend and Client repositories"
    ]
  },
  {
    step: 12,
    title: "Deploy Project 2 (Client) to Render or Cloud",
    subtitle: "Deploy web client to Render and connect production frontend to production backend",
    targetProject: "Deployment & Integration",
    explanation: "Deploy Project 2 to Render as a Web Service. Set `API_BASE_URL` to `https://your-api.onrender.com` in Render environment settings.",
    commands: [
      "# On Render Dashboard for Project 2 Client Web Service:",
      "Build Command:  pip install -r requirements.txt",
      "Start Command:  gunicorn app:app",
      "Environment Variables:",
      "  - FLASK_ENV = production",
      "  - SECRET_KEY = <generated_client_secret>",
      "  - API_BASE_URL = https://your-api.onrender.com",
      "  - API_TIMEOUT = 20"
    ],
    keyFiles: ["requirements.txt", "app.py"],
    checkpoints: [
      "Project 2 deployed at `https://your-client.onrender.com`",
      "Live client communicates over HTTPS with Project 1 Backend on Render",
      "Both applications operate completely decoupled across the cloud!"
    ],
    tips: [
      "Ensure CORS on Project 1 (`CORS_ORIGINS`) allows your client domain.",
      "Congratulations! You now have a complete, production-ready decoupled architecture!"
    ]
  }
];
