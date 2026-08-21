"""
Tasks & Notes API Routes
Endpoints:
  GET    /api/tasks          - List all tasks for authenticated user
  POST   /api/tasks          - Create a new task/note
  GET    /api/tasks/<id>     - Get single task by ID (ownership strictly enforced)
  PUT    /api/tasks/<id>     - Update task (ownership strictly enforced)
  DELETE /api/tasks/<id>     - Delete task (ownership strictly enforced)
  GET    /api/tasks/search   - Search query across title & description
  GET    /api/tasks/filter   - Filter by status and/or category
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.models import db, Task
from app.utils.auth import token_required

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

VALID_STATUSES = ["pending", "in_progress", "completed"]
VALID_CATEGORIES = ["General", "Work", "Personal", "Study", "Ideas", "Urgent", "Finance"]


@tasks_bp.route("", methods=["GET"])
@token_required
def get_all_tasks(current_user):
    """
    Get all tasks belonging strictly to the authenticated user.
    Supports optional query parameters:
      - sort: created_asc, created_desc (default), title_asc, status
      - limit, offset for pagination
    """
    sort_order = request.args.get("sort", "created_desc")
    
    query = Task.query.filter_by(user_id=current_user.id)
    
    if sort_order == "created_asc":
        query = query.order_by(Task.created_at.asc())
    elif sort_order == "title_asc":
        query = query.order_by(Task.title.asc())
    elif sort_order == "status":
        query = query.order_by(Task.status.asc(), Task.created_at.desc())
    else:
        query = query.order_by(Task.created_at.desc())
        
    tasks = query.all()
    
    # Calculate category counts & status metrics for convenient client dashboard consumption
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    pending = sum(1 for t in tasks if t.status == "pending")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    
    categories = {}
    for t in tasks:
        categories[t.category] = categories.get(t.category, 0) + 1
        
    return jsonify({
        "success": True,
        "count": total,
        "metrics": {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "categories": categories
        },
        "data": [task.to_dict() for task in tasks]
    }), 200


@tasks_bp.route("", methods=["POST"])
@token_required
def create_task(current_user):
    """
    Create a new task for the authenticated user.
    Expects JSON: { "title": "...", "description": "...", "category": "...", "status": "..." }
    """
    data = request.get_json(silent=True) or {}
    
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    category = (data.get("category") or "General").strip()
    status = (data.get("status") or "pending").strip().lower()
    
    # Input Validation
    errors = {}
    if not title:
        errors["title"] = "Task title is required."
    elif len(title) > 200:
        errors["title"] = "Title cannot exceed 200 characters."
        
    if status not in VALID_STATUSES:
        status = "pending"
        
    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed.",
            "errors": errors
        }), 400
        
    try:
        new_task = Task(
            user_id=current_user.id,
            title=title,
            description=description,
            category=category,
            status=status
        )
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Task created successfully.",
            "data": new_task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to create task: {str(e)}",
            "error": "DATABASE_ERROR"
        }), 500


@tasks_bp.route("/<int:task_id>", methods=["GET"])
@token_required
def get_task(current_user, task_id):
    """
    Get a single task by ID.
    Enforces user isolation: Returns 404 if task does not exist, or 403 if owned by another user.
    """
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({
            "success": False,
            "message": f"Task with ID {task_id} not found.",
            "error": "NOT_FOUND"
        }), 404
        
    if task.user_id != current_user.id:
        return jsonify({
            "success": False,
            "message": "Access denied. You do not have permission to view this task.",
            "error": "FORBIDDEN"
        }), 403
        
    return jsonify({
        "success": True,
        "data": task.to_dict()
    }), 200


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    """
    Update an existing task.
    Enforces user isolation: Returns 403 if attempting to edit someone else's task.
    """
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({
            "success": False,
            "message": f"Task with ID {task_id} not found.",
            "error": "NOT_FOUND"
        }), 404
        
    if task.user_id != current_user.id:
        return jsonify({
            "success": False,
            "message": "Access denied. You can only modify your own tasks.",
            "error": "FORBIDDEN"
        }), 403
        
    data = request.get_json(silent=True) or {}
    
    # Update title if supplied
    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({
                "success": False,
                "message": "Title cannot be empty.",
                "error": "VALIDATION_ERROR"
            }), 400
        task.title = title
        
    # Update description if supplied
    if "description" in data:
        task.description = (data.get("description") or "").strip()
        
    # Update category if supplied
    if "category" in data:
        cat = (data.get("category") or "").strip()
        if cat:
            task.category = cat
            
    # Update status if supplied
    if "status" in data:
        new_status = (data.get("status") or "").strip().lower()
        if new_status in VALID_STATUSES:
            task.status = new_status
            
    task.updated_at = datetime.now(timezone.utc)
    
    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Task updated successfully.",
            "data": task.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update task: {str(e)}",
            "error": "DATABASE_ERROR"
        }), 500


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    """
    Delete an existing task.
    Enforces user isolation: Returns 403 if attempting to delete someone else's task.
    """
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({
            "success": False,
            "message": f"Task with ID {task_id} not found.",
            "error": "NOT_FOUND"
        }), 404
        
    if task.user_id != current_user.id:
        return jsonify({
            "success": False,
            "message": "Access denied. You can only delete your own tasks.",
            "error": "FORBIDDEN"
        }), 403
        
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Task '{task.title}' was successfully deleted.",
            "deleted_id": task_id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to delete task: {str(e)}",
            "error": "DATABASE_ERROR"
        }), 500


@tasks_bp.route("/search", methods=["GET"])
@token_required
def search_tasks(current_user):
    """
    Search tasks belonging to the current user by keyword in title or description.
    Query parameter: `?q=keyword`
    """
    query_str = (request.args.get("q") or "").strip()
    
    if not query_str:
        # If query is empty, return standard list
        tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_at.desc()).all()
    else:
        search_pattern = f"%{query_str}%"
        tasks = Task.query.filter(
            Task.user_id == current_user.id,
            (Task.title.ilike(search_pattern) | Task.description.ilike(search_pattern))
        ).order_by(Task.created_at.desc()).all()
        
    return jsonify({
        "success": True,
        "query": query_str,
        "count": len(tasks),
        "data": [task.to_dict() for task in tasks]
    }), 200


@tasks_bp.route("/filter", methods=["GET"])
@token_required
def filter_tasks(current_user):
    """
    Filter tasks by status and/or category.
    Query parameters:
      - status: pending | in_progress | completed
      - category: General | Work | Personal | ...
    """
    status = request.args.get("status")
    category = request.args.get("category")
    
    query = Task.query.filter_by(user_id=current_user.id)
    
    if status and status in VALID_STATUSES:
        query = query.filter_by(status=status)
        
    if category:
        query = query.filter_by(category=category)
        
    tasks = query.order_by(Task.created_at.desc()).all()
    
    return jsonify({
        "success": True,
        "filters_applied": {
            "status": status,
            "category": category
        },
        "count": len(tasks),
        "data": [task.to_dict() for task in tasks]
    }), 200
