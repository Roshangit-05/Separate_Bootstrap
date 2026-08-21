export interface CodeFile {
  path: string;
  name: string;
  project: "backend" | "client" | "root";
  language: "python" | "html" | "css" | "javascript" | "markdown" | "json" | "env" | "text";
  description: string;
  content: string;
}

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  authRequired: boolean;
  requestBody?: string;
  queryParams?: Array<{ name: string; type: string; description: string }>;
  responseSuccess: {
    status: number;
    body: string;
  };
  responseError?: {
    status: number;
    body: string;
  };
}

export interface GuideStep {
  step: number;
  title: string;
  subtitle: string;
  targetProject: "Project 1 (Backend)" | "Project 2 (Client)" | "Deployment & Integration";
  commands?: string[];
  explanation: string;
  keyFiles?: string[];
  checkpoints: string[];
  tips?: string[];
}

export interface TaskItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface MockUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}
