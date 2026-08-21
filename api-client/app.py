"""
Project 2 - REST API Client Web Application
Powered by Flask & Bootstrap 5.
Communicates strictly with Project 1 Backend via HTTP REST requests.
"""

from functools import wraps
import os
from flask import (
    Flask, render_template, request, redirect, 
    url_for, flash, session, jsonify
)
from config import Config
from api_client import api

app = Flask(__name__)
app.config.from_object(Config)


def login_required(f):
    """Decorator to enforce authenticated session before accessing protected pages."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "jwt_token" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


@app.context_processor
def inject_globals():
    """Make current user info and API URL available in all Jinja templates."""
    return {
        "current_user": session.get("user"),
        "api_base_url": app.config.get("API_BASE_URL")
    }


# ==============================================================================
# AUTHENTICATION ROUTES
# ==============================================================================

@app.route("/")
def index():
    """Root route: Redirects authenticated users to dashboard, others to login."""
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    """User Login Page & Submission."""
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        if not email or not password:
            flash("Please enter both email and password.", "danger")
            return render_template("login.html", email=email)

        # Call Project 1 REST API POST /api/auth/login
        success, data, message, status = api.post("/api/auth/login", {
            "email": email,
            "password": password
        })

        if success and data and "token" in data:
            # Store JWT and user object securely in Flask session
            session["jwt_token"] = data["token"]
            session["user"] = data.get("user", {})
            flash("Welcome back! Login successful.", "success")
            return redirect(url_for("dashboard"))
        else:
            flash(message or "Invalid credentials. Please try again.", "danger")
            return render_template("login.html", email=email)

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """User Registration Page & Submission."""
    if "jwt_token" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html", name=name, email=email)

        # Call Project 1 REST API POST /api/auth/register
        success, data, message, status = api.post("/api/auth/register", {
            "name": name,
            "email": email,
            "password": password
        })

        if success and data and "token" in data:
            session["jwt_token"] = data["token"]
            session["user"] = data.get("user", {})
            flash("Account successfully created! You are now logged in.", "success")
            return redirect(url_for("dashboard"))
        else:
            flash(message or "Registration failed.", "danger")
            return render_template("register.html", name=name, email=email)

    return render_template("register.html")


@app.route("/logout", methods=["GET", "POST"])
def logout():
    """Clear session and notify backend."""
    if "jwt_token" in session:
        # Inform backend
        api.post("/api/auth/logout")
    
    session.clear()
    flash("You have been safely logged out.", "info")
    return redirect(url_for("login"))


# ==============================================================================
# DASHBOARD & TASK MANAGEMENT ROUTES
# ==============================================================================

@app.route("/dashboard")
@login_required
def dashboard():
    """User Dashboard: Displays task summary metrics, categorized list, and creation modal."""
    search_query = request.args.get("q", "").strip()
    status_filter = request.args.get("status", "").strip()
    category_filter = request.args.get("category", "").strip()

    # Determine endpoint based on active filter / search
    if search_query:
        success, res_data, message, status = api.get("/api/tasks/search", params={"q": search_query})
        tasks = res_data if isinstance(res_data, list) else []
        metrics = None
    elif status_filter or category_filter:
        params = {}
        if status_filter:
            params["status"] = status_filter
        if category_filter:
            params["category"] = category_filter
        success, res_data, message, status = api.get("/api/tasks/filter", params=params)
        tasks = res_data if isinstance(res_data, list) else []
        metrics = None
    else:
        # Standard full fetch
        success, res_data, message, status = api.get("/api/tasks")
        if success and isinstance(res_data, dict):
            tasks = res_data.get("data", [])
            metrics = res_data.get("metrics", {})
        elif isinstance(res_data, list):
            tasks = res_data
            metrics = None
        else:
            tasks = []
            metrics = None

    if not success and status == 401:
        session.clear()
        flash("Your session has expired. Please log in again.", "warning")
        return redirect(url_for("login"))

    if not success:
        flash(message, "danger")

    # If metrics were not returned by search/filter, calculate locally for view cards
    if not metrics:
        total = len(tasks)
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        pending = sum(1 for t in tasks if t.get("status") == "pending")
        in_prog = sum(1 for t in tasks if t.get("status") == "in_progress")
        categories = {}
        for t in tasks:
            c = t.get("category", "General")
            categories[c] = categories.get(c, 0) + 1
        metrics = {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_prog,
            "categories": categories
        }

    return render_template(
        "dashboard.html",
        tasks=tasks,
        metrics=metrics,
        search_query=search_query,
        status_filter=status_filter,
        category_filter=category_filter
    )


@app.route("/tasks/create", methods=["POST"])
@login_required
def create_task():
    """Create a new task via REST API."""
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "General").strip()
    status = request.form.get("status", "pending").strip()

    if not title:
        flash("Task title cannot be empty.", "danger")
        return redirect(url_for("dashboard"))

    success, data, message, status_code = api.post("/api/tasks", {
        "title": title,
        "description": description,
        "category": category,
        "status": status
    })

    if success:
        flash("Task successfully created!", "success")
    else:
        flash(f"Failed to create task: {message}", "danger")

    return redirect(url_for("dashboard"))


@app.route("/tasks/<int:task_id>")
@login_required
def view_task(task_id):
    """View and edit a single task."""
    success, data, message, status_code = api.get(f"/api/tasks/{task_id}")

    if not success:
        if status_code == 404:
            flash("Task not found.", "danger")
        elif status_code == 403:
            flash("You do not have permission to view this task.", "danger")
        else:
            flash(message, "danger")
        return redirect(url_for("dashboard"))

    return render_template("task.html", task=data)


@app.route("/tasks/<int:task_id>/edit", methods=["POST"])
@login_required
def edit_task(task_id):
    """Update task details."""
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "General").strip()
    status = request.form.get("status", "pending").strip()

    success, data, message, status_code = api.put(f"/api/tasks/{task_id}", {
        "title": title,
        "description": description,
        "category": category,
        "status": status
    })

    if success:
        flash("Task updated successfully.", "success")
    else:
        flash(f"Update failed: {message}", "danger")

    return redirect(url_for("view_task", task_id=task_id))


@app.route("/tasks/<int:task_id>/toggle-status", methods=["POST"])
@login_required
def toggle_status(task_id):
    """Quick toggle of task status from dashboard list."""
    current_status = request.form.get("current_status", "pending")
    new_status = "completed" if current_status != "completed" else "pending"

    success, data, message, status_code = api.put(f"/api/tasks/{task_id}", {
        "status": new_status
    })

    if success:
        status_label = "completed" if new_status == "completed" else "marked pending"
        flash(f"Task status updated to {status_label}.", "success")
    else:
        flash(f"Failed to update status: {message}", "danger")

    return redirect(request.referrer or url_for("dashboard"))


@app.route("/tasks/<int:task_id>/delete", methods=["POST"])
@login_required
def delete_task(task_id):
    """Delete task via REST API."""
    success, data, message, status_code = api.delete(f"/api/tasks/{task_id}")

    if success:
        flash("Task deleted successfully.", "info")
    else:
        flash(f"Failed to delete task: {message}", "danger")

    return redirect(url_for("dashboard"))


@app.route("/profile")
@login_required
def profile():
    """User Profile and Account Statistics page."""
    success, data, message, status_code = api.get("/api/auth/profile")

    user_data = session.get("user", {})
    if success and data and "user" in data:
        user_data = data["user"]
        session["user"] = user_data  # refresh session

    return render_template("profile.html", user=user_data)


# ==============================================================================
# ENTRYPOINT
# ==============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"🚀 Project 2: API Client Application starting on http://127.0.0.1:{port}")
    print(f"🔗 Target REST API Backend: {app.config.get('API_BASE_URL')}")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
