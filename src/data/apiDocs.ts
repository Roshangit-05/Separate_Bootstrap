import { ApiEndpoint } from "../types";

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "auth-register",
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new user account with hashed password and return an initial JWT Bearer access token.",
    authRequired: false,
    requestBody: JSON.stringify({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "securepassword123"
    }, null, 2),
    responseSuccess: {
      status: 201,
      body: JSON.stringify({
        success: true,
        message: "User account successfully created.",
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiamFuZUBleGFtcGxlLmNvbSIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxNzMwMDg2NDAwfQ.s7D_xyz...",
          token_type: "Bearer",
          user: {
            id: 1,
            name: "Jane Doe",
            email: "jane@example.com",
            created_at: "2026-08-21T02:20:00"
          }
        }
      }, null, 2)
    },
    responseError: {
      status: 400,
      body: JSON.stringify({
        success: false,
        message: "Validation failed.",
        errors: {
          email: "An account with this email address already exists."
        }
      }, null, 2)
    }
  },
  {
    id: "auth-login",
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate with email and password to receive a signed JWT access token.",
    authRequired: false,
    requestBody: JSON.stringify({
      email: "jane@example.com",
      password: "securepassword123"
    }, null, 2),
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        message: "Login successful.",
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiamFuZUBleGFtcGxlLmNvbSIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxNzMwMDg2NDAwfQ.s7D_xyz...",
          token_type: "Bearer",
          user: {
            id: 1,
            name: "Jane Doe",
            email: "jane@example.com",
            total_tasks: 4,
            completed_tasks: 2,
            pending_tasks: 2
          }
        }
      }, null, 2)
    },
    responseError: {
      status: 401,
      body: JSON.stringify({
        success: false,
        message: "Invalid email or password.",
        error: "INVALID_CREDENTIALS"
      }, null, 2)
    }
  },
  {
    id: "auth-profile",
    method: "GET",
    path: "/api/auth/profile",
    description: "Retrieve profile data and task statistics for the currently authenticated user.",
    authRequired: true,
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 1,
            name: "Jane Doe",
            email: "jane@example.com",
            created_at: "2026-08-21T02:20:00",
            total_tasks: 4,
            completed_tasks: 2,
            pending_tasks: 2
          }
        }
      }, null, 2)
    },
    responseError: {
      status: 401,
      body: JSON.stringify({
        success: false,
        message: "Token has expired. Please log in again.",
        error: "TOKEN_EXPIRED"
      }, null, 2)
    }
  },
  {
    id: "auth-logout",
    method: "POST",
    path: "/api/auth/logout",
    description: "Stateless logout acknowledgement for client-side token discard.",
    authRequired: true,
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        message: "Successfully logged out. Please remove stored token on client."
      }, null, 2)
    }
  },
  {
    id: "tasks-get-all",
    method: "GET",
    path: "/api/tasks",
    description: "List all tasks and notes owned by authenticated user, including summary metrics for total, completed, pending, and category breakdown.",
    authRequired: true,
    queryParams: [
      { name: "sort", type: "string", description: "created_desc (default), created_asc, title_asc, status" }
    ],
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        count: 2,
        metrics: {
          total: 2,
          completed: 1,
          pending: 1,
          in_progress: 0,
          categories: {
            Work: 1,
            Personal: 1
          }
        },
        data: [
          {
            id: 101,
            user_id: 1,
            title: "Prepare Sprint Presentation",
            description: "Include system architecture diagrams and API specs",
            category: "Work",
            status: "in_progress",
            created_at: "2026-08-21T02:30:00",
            updated_at: "2026-08-21T02:30:00"
          },
          {
            id: 102,
            user_id: 1,
            title: "Buy groceries & coffee beans",
            description: "Organic roast and fresh fruit",
            category: "Personal",
            status: "completed",
            created_at: "2026-08-21T02:25:00",
            updated_at: "2026-08-21T02:35:00"
          }
        ]
      }, null, 2)
    }
  },
  {
    id: "tasks-create",
    method: "POST",
    path: "/api/tasks",
    description: "Create a new task or note for the authenticated user.",
    authRequired: true,
    requestBody: JSON.stringify({
      title: "Deploy API Backend to Render",
      description: "Ensure environment variables and Gunicorn start command are set",
      category: "Work",
      status: "pending"
    }, null, 2),
    responseSuccess: {
      status: 201,
      body: JSON.stringify({
        success: true,
        message: "Task created successfully.",
        data: {
          id: 103,
          user_id: 1,
          title: "Deploy API Backend to Render",
          description: "Ensure environment variables and Gunicorn start command are set",
          category: "Work",
          status: "pending",
          created_at: "2026-08-21T02:40:00",
          updated_at: "2026-08-21T02:40:00"
        }
      }, null, 2)
    },
    responseError: {
      status: 400,
      body: JSON.stringify({
        success: false,
        message: "Validation failed.",
        errors: {
          title: "Task title is required."
        }
      }, null, 2)
    }
  },
  {
    id: "tasks-get-single",
    method: "GET",
    path: "/api/tasks/<id>",
    description: "Retrieve single task by ID. Returns 403 Forbidden if task belongs to a different user.",
    authRequired: true,
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          id: 101,
          user_id: 1,
          title: "Prepare Sprint Presentation",
          description: "Include system architecture diagrams and API specs",
          category: "Work",
          status: "in_progress",
          created_at: "2026-08-21T02:30:00",
          updated_at: "2026-08-21T02:30:00"
        }
      }, null, 2)
    },
    responseError: {
      status: 403,
      body: JSON.stringify({
        success: false,
        message: "Access denied. You do not have permission to view this task.",
        error: "FORBIDDEN"
      }, null, 2)
    }
  },
  {
    id: "tasks-update",
    method: "PUT",
    path: "/api/tasks/<id>",
    description: "Update task title, description, category, or status. Enforces user ownership.",
    authRequired: true,
    requestBody: JSON.stringify({
      title: "Prepare Sprint Presentation (Finalized)",
      status: "completed",
      category: "Work"
    }, null, 2),
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        message: "Task updated successfully.",
        data: {
          id: 101,
          user_id: 1,
          title: "Prepare Sprint Presentation (Finalized)",
          description: "Include system architecture diagrams and API specs",
          category: "Work",
          status: "completed",
          created_at: "2026-08-21T02:30:00",
          updated_at: "2026-08-21T02:45:00"
        }
      }, null, 2)
    }
  },
  {
    id: "tasks-delete",
    method: "DELETE",
    path: "/api/tasks/<id>",
    description: "Delete a task by ID. Enforces user ownership.",
    authRequired: true,
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        message: "Task 'Prepare Sprint Presentation' was successfully deleted.",
        deleted_id: 101
      }, null, 2)
    }
  },
  {
    id: "tasks-search",
    method: "GET",
    path: "/api/tasks/search",
    description: "Search notes and tasks across title and description using SQL ILIKE pattern matching.",
    authRequired: true,
    queryParams: [
      { name: "q", type: "string", description: "Search query keyword" }
    ],
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        query: "Sprint",
        count: 1,
        data: [
          {
            id: 101,
            user_id: 1,
            title: "Prepare Sprint Presentation",
            description: "Include system architecture diagrams and API specs",
            category: "Work",
            status: "in_progress",
            created_at: "2026-08-21T02:30:00",
            updated_at: "2026-08-21T02:30:00"
          }
        ]
      }, null, 2)
    }
  },
  {
    id: "tasks-filter",
    method: "GET",
    path: "/api/tasks/filter",
    description: "Filter tasks by status and/or category.",
    authRequired: true,
    queryParams: [
      { name: "status", type: "string", description: "pending | in_progress | completed" },
      { name: "category", type: "string", description: "General | Work | Personal | Study | Ideas | Urgent | Finance" }
    ],
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        success: true,
        filters_applied: {
          status: "pending",
          category: "Work"
        },
        count: 1,
        data: [
          {
            id: 103,
            user_id: 1,
            title: "Deploy API Backend to Render",
            description: "Ensure environment variables and Gunicorn start command are set",
            category: "Work",
            status: "pending",
            created_at: "2026-08-21T02:40:00",
            updated_at: "2026-08-21T02:40:00"
          }
        ]
      }, null, 2)
    }
  },
  {
    id: "system-health",
    method: "GET",
    path: "/api/health",
    description: "Uptime and health check endpoint for monitoring probes and Render cold-start checks.",
    authRequired: false,
    responseSuccess: {
      status: 200,
      body: JSON.stringify({
        status: "healthy",
        service: "Task & Notes REST API",
        version: "1.0.0",
        database: "connected"
      }, null, 2)
    }
  }
];
