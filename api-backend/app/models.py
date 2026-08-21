"""
Database Models for Task & Notes Management API
Includes User and Task models with relationships and password hashing.
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize SQLAlchemy instance (bound in create_app)
db = SQLAlchemy()


class User(db.Model):
    """User Model for registration, authentication, and task ownership."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # 1-to-Many Relationship: One User has many Tasks/Notes
    tasks = db.relationship(
        "Task", 
        backref="author", 
        lazy="dynamic", 
        cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        """Securely hash and store password using Werkzeug pbkdf2:sha256."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify provided password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_stats: bool = False) -> dict:
        """Serialize user object to dictionary (excluding sensitive password hash)."""
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_stats:
            data["total_tasks"] = self.tasks.count()
            data["completed_tasks"] = self.tasks.filter_by(status="completed").count()
            data["pending_tasks"] = self.tasks.filter(Task.status != "completed").count()
        return data

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}'>"


class Task(db.Model):
    """Task / Note Model owned by a specific User."""
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default="General", nullable=False, index=True)
    status = db.Column(db.String(30), default="pending", nullable=False, index=True)  # pending, in_progress, completed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    def to_dict(self) -> dict:
        """Serialize task object to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description or "",
            "category": self.category,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self) -> str:
        return f"<Task id={self.id} user_id={self.user_id} title='{self.title[:20]}...'>"
