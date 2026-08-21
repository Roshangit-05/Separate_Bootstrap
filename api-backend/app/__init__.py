"""
Flask Application Factory
Initializes database, CORS, registers authentication and task blueprints,
registers global error handlers, and provides API test interface.
"""

import os
from flask import Flask, jsonify, render_template_string
from flask_cors import CORS
from app.config import config_by_name
from app.models import db


def create_app(config_name=None):
    """Factory function to configure and initialize the Flask application."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")
        
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))
    
    # Initialize Extensions
    db.init_app(app)
    
    # Configure Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
    
    # Ensure database tables exist and instance folder is present
    with app.app_context():
        # Ensure instance directory exists for SQLite
        os.makedirs(os.path.join(app.root_path, "..", "instance"), exist_ok=True)
        db.create_all()
        
    # Register API Blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    
    # Health Check Endpoint (useful for Render deployment verification)
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Task & Notes REST API",
            "version": "1.0.0",
            "database": "connected"
        }), 200

    # Embedded Interactive Bootstrap API Testing / Admin Home Page
    @app.route("/", methods=["GET"])
    def api_home():
        html_content = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Task & Notes REST API - Service Status & Documentation</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
            <style>
                body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
                .hero-badge { background: #e0e7ff; color: #4338ca; font-weight: 600; font-size: 0.8rem; padding: 4px 12px; border-radius: 9999px; }
                .method-badge { font-weight: 700; font-size: 0.75rem; width: 65px; text-align: center; display: inline-block; }
                .card { border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                pre { background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 8px; font-size: 0.85rem; }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand fw-bold" href="#">
                        <i class="bi bi-cpu-fill text-primary me-2"></i>Task & Notes REST API
                    </a>
                    <span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Live & Operational</span>
                </div>
            </nav>

            <div class="container py-5">
                <div class="row g-4">
                    <div class="col-lg-8">
                        <div class="card p-4 mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="hero-badge">PROJECT 1 — BACKEND SERVICE</span>
                                <span class="text-muted small">Flask 3.0 + SQLite + JWT</span>
                            </div>
                            <h2 class="fw-bold mb-2">REST API Endpoints Reference</h2>
                            <p class="text-secondary">This production-ready REST API powers the separate Project 2 Client application. All requests expect and return JSON.</p>

                            <div class="table-responsive mt-3">
                                <table class="table table-hover align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Method</th>
                                            <th>Endpoint</th>
                                            <th>Auth Required</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span class="badge bg-primary method-badge">POST</span></td>
                                            <td><code>/api/auth/register</code></td>
                                            <td><span class="badge bg-secondary">No</span></td>
                                            <td>Create a new user account & get initial JWT</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-primary method-badge">POST</span></td>
                                            <td><code>/api/auth/login</code></td>
                                            <td><span class="badge bg-secondary">No</span></td>
                                            <td>Authenticate email/password and obtain JWT token</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success method-badge">GET</span></td>
                                            <td><code>/api/auth/profile</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Retrieve user profile details and task stats</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-primary method-badge">POST</span></td>
                                            <td><code>/api/auth/logout</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Client token revocation confirmation</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success method-badge">GET</span></td>
                                            <td><code>/api/tasks</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Get user's tasks with metrics (supports sorting)</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-primary method-badge">POST</span></td>
                                            <td><code>/api/tasks</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Create a new task / note</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success method-badge">GET</span></td>
                                            <td><code>/api/tasks/&lt;id&gt;</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Get single task details (ownership verified)</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-warning text-dark method-badge">PUT</span></td>
                                            <td><code>/api/tasks/&lt;id&gt;</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Update task fields (ownership verified)</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-danger method-badge">DELETE</span></td>
                                            <td><code>/api/tasks/&lt;id&gt;</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Delete task (ownership verified)</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success method-badge">GET</span></td>
                                            <td><code>/api/tasks/search?q=...</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Search notes by keyword</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success method-badge">GET</span></td>
                                            <td><code>/api/tasks/filter?status=...&category=...</code></td>
                                            <td><span class="badge bg-warning text-dark">Bearer JWT</span></td>
                                            <td>Filter user tasks by category or status</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-info text-dark method-badge">GET</span></td>
                                            <td><code>/api/health</code></td>
                                            <td><span class="badge bg-secondary">No</span></td>
                                            <td>Health probe for Render uptime checks</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card p-4 mb-4">
                            <h5 class="fw-bold mb-3"><i class="bi bi-shield-lock-fill text-primary me-2"></i>Quick Test cURL</h5>
                            <p class="small text-muted">Register a test user and obtain a JWT:</p>
                            <pre><code>curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com","password":"password123"}'</code></pre>
                            
                            <p class="small text-muted mt-3">Fetch tasks with Bearer token:</p>
                            <pre><code>curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer &lt;YOUR_TOKEN&gt;"</code></pre>
                        </div>

                        <div class="card p-4">
                            <h5 class="fw-bold mb-3"><i class="bi bi-diagram-3-fill text-primary me-2"></i>Architecture</h5>
                            <ul class="list-unstyled small text-muted mb-0">
                                <li class="mb-2"><i class="bi bi-check2 text-success me-1"></i> Isolated SQLite database file</li>
                                <li class="mb-2"><i class="bi bi-check2 text-success me-1"></i> Werkzeug salted password hashing</li>
                                <li class="mb-2"><i class="bi bi-check2 text-success me-1"></i> HMAC-SHA256 Signed JWTs</li>
                                <li class="mb-2"><i class="bi bi-check2 text-success me-1"></i> Strict multi-tenant user isolation</li>
                                <li><i class="bi bi-check2 text-success me-1"></i> Deployable to Render via Gunicorn</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return render_template_string(html_content)
        
    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad Request", "error": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource or endpoint not found", "error": "NOT_FOUND"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "HTTP Method not allowed on this endpoint", "error": "METHOD_NOT_ALLOWED"}), 405

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({"success": False, "message": "Internal server error occurred", "error": "INTERNAL_SERVER_ERROR"}), 500

    return app
