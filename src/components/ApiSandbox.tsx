import React, { useState } from "react";
import { 
  Play, 
  Terminal, 
  Copy, 
  Check, 
  Key, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Send,
  Database,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { API_ENDPOINTS } from "../data/apiDocs";
import { ApiEndpoint, TaskItem, MockUser } from "../types";

export const ApiSandbox: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [bearerToken, setBearerToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiamFuZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.mock_signature");
  const [requestBodyText, setRequestBodyText] = useState<string>(selectedEndpoint.requestBody || "");
  const [queryParamsText, setQueryParamsText] = useState<string>("");
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // In-memory simulated SQLite state
  const [simUsers, setSimUsers] = useState<MockUser[]>([
    { id: 1, name: "Jane Doe", email: "jane@example.com", created_at: new Date().toISOString() }
  ]);
  const [simTasks, setSimTasks] = useState<TaskItem[]>([
    {
      id: 101,
      user_id: 1,
      title: "Deploy API Backend to Render",
      description: "Set Gunicorn start command and environment variables in Render Web Service.",
      category: "Work",
      status: "pending",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 102,
      user_id: 1,
      title: "Integrate Bootstrap 5 Client App",
      description: "Connect Project 2 client forms to Project 1 REST endpoints.",
      category: "Work",
      status: "in_progress",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 103,
      user_id: 1,
      title: "Weekly Grocery & Supply Run",
      description: "Organic coffee, fruit, and snacks for hackathon sprint.",
      category: "Personal",
      status: "completed",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString()
    }
  ]);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(ep.requestBody || "");
    setQueryParamsText(
      ep.id === "tasks-search" ? "q=Render" :
      ep.id === "tasks-filter" ? "status=pending&category=Work" :
      ""
    );
    setResponseOutput(null);
    setResponseStatus(null);
  };

  const handleExecuteRequest = () => {
    const ep = selectedEndpoint;
    let parsedBody: any = {};
    if (requestBodyText && (ep.method === "POST" || ep.method === "PUT")) {
      try {
        parsedBody = JSON.parse(requestBodyText);
      } catch (err) {
        setResponseStatus(400);
        setResponseOutput({ success: false, message: "Invalid JSON format in request body." });
        return;
      }
    }

    // Simulate endpoint execution
    setTimeout(() => {
      setResponseHeaders({
        "Content-Type": "application/json",
        "Server": "Gunicorn/21.2.0 (Flask/3.0.2)",
        "Date": new Date().toUTCString(),
        "Access-Control-Allow-Origin": "*"
      });

      // Authentication validation for protected endpoints
      if (ep.authRequired && (!bearerToken || bearerToken.trim() === "")) {
        setResponseStatus(401);
        setResponseOutput({
          success: false,
          message: "Authorization token is missing. Please provide 'Authorization: Bearer <token>'",
          error: "UNAUTHORIZED"
        });
        return;
      }

      if (ep.id === "system-health") {
        setResponseStatus(200);
        setResponseOutput({
          status: "healthy",
          service: "Task & Notes REST API",
          version: "1.0.0",
          database: "connected"
        });
      } else if (ep.id === "auth-register") {
        const { name, email, password } = parsedBody;
        if (!name || !email || !password) {
          setResponseStatus(400);
          setResponseOutput({ success: false, message: "Validation failed.", errors: { email: "All fields required." } });
          return;
        }
        const newUser: MockUser = {
          id: simUsers.length + 1,
          name,
          email,
          created_at: new Date().toISOString()
        };
        setSimUsers([...simUsers, newUser]);
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiR7bmV3VXNlci5pZH0sImVtYWlsIjoiJHtuZXdVc2VyLmVtYWlsfSJ9.mock_token_${Date.now()}`;
        setBearerToken(token);
        setResponseStatus(201);
        setResponseOutput({
          success: true,
          message: "User account successfully created.",
          data: {
            token,
            token_type: "Bearer",
            user: newUser
          }
        });
      } else if (ep.id === "auth-login") {
        const { email, password } = parsedBody;
        const user = simUsers.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
        if (!user) {
          setResponseStatus(401);
          setResponseOutput({ success: false, message: "Invalid email or password.", error: "INVALID_CREDENTIALS" });
          return;
        }
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiR7dXNlci5pZH0sImVtYWlsIjoiJHt1c2VyLmVtYWlsfSJ9.mock_token_${Date.now()}`;
        setBearerToken(token);
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          message: "Login successful.",
          data: {
            token,
            token_type: "Bearer",
            user: {
              ...user,
              total_tasks: simTasks.length,
              completed_tasks: simTasks.filter(t => t.status === "completed").length,
              pending_tasks: simTasks.filter(t => t.status === "pending").length
            }
          }
        });
      } else if (ep.id === "auth-profile") {
        const user = simUsers[0] || { id: 1, name: "Jane Doe", email: "jane@example.com", created_at: new Date().toISOString() };
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          data: {
            user: {
              ...user,
              total_tasks: simTasks.length,
              completed_tasks: simTasks.filter(t => t.status === "completed").length,
              pending_tasks: simTasks.filter(t => t.status === "pending").length
            }
          }
        });
      } else if (ep.id === "auth-logout") {
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          message: "Successfully logged out. Please remove stored token on client."
        });
      } else if (ep.id === "tasks-get-all") {
        const completed = simTasks.filter(t => t.status === "completed").length;
        const pending = simTasks.filter(t => t.status === "pending").length;
        const in_progress = simTasks.filter(t => t.status === "in_progress").length;
        const categories: Record<string, number> = {};
        simTasks.forEach(t => {
          categories[t.category] = (categories[t.category] || 0) + 1;
        });

        setResponseStatus(200);
        setResponseOutput({
          success: true,
          count: simTasks.length,
          metrics: {
            total: simTasks.length,
            completed,
            pending,
            in_progress,
            categories
          },
          data: simTasks
        });
      } else if (ep.id === "tasks-create") {
        const { title, description, category, status } = parsedBody;
        if (!title) {
          setResponseStatus(400);
          setResponseOutput({ success: false, message: "Validation failed.", errors: { title: "Title is required." } });
          return;
        }
        const newTask: TaskItem = {
          id: Math.max(...simTasks.map(t => t.id), 100) + 1,
          user_id: 1,
          title,
          description: description || "",
          category: category || "General",
          status: status || "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSimTasks([newTask, ...simTasks]);
        setResponseStatus(201);
        setResponseOutput({
          success: true,
          message: "Task created successfully.",
          data: newTask
        });
      } else if (ep.id === "tasks-get-single") {
        const task = simTasks[0];
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          data: task
        });
      } else if (ep.id === "tasks-update") {
        if (simTasks.length === 0) {
          setResponseStatus(404);
          setResponseOutput({ success: false, message: "Task not found." });
          return;
        }
        const updated = { ...simTasks[0], ...parsedBody, updated_at: new Date().toISOString() };
        setSimTasks([updated, ...simTasks.slice(1)]);
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          message: "Task updated successfully.",
          data: updated
        });
      } else if (ep.id === "tasks-delete") {
        if (simTasks.length === 0) {
          setResponseStatus(404);
          setResponseOutput({ success: false, message: "Task not found." });
          return;
        }
        const target = simTasks[0];
        setSimTasks(simTasks.slice(1));
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          message: `Task '${target.title}' was successfully deleted.`,
          deleted_id: target.id
        });
      } else if (ep.id === "tasks-search") {
        const q = (queryParamsText.replace("q=", "") || "Render").toLowerCase();
        const results = simTasks.filter(
          t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        );
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          query: q,
          count: results.length,
          data: results
        });
      } else if (ep.id === "tasks-filter") {
        const results = simTasks.filter(t => t.status === "pending" && t.category === "Work");
        setResponseStatus(200);
        setResponseOutput({
          success: true,
          filters_applied: { status: "pending", category: "Work" },
          count: results.length,
          data: results
        });
      }
    }, 150);
  };

  // Generate dynamic cURL command
  const buildCurlCommand = () => {
    const ep = selectedEndpoint;
    let url = `http://127.0.0.1:5000${ep.path.replace("<id>", "101")}`;
    if (queryParamsText) {
      url += `?${queryParamsText}`;
    }

    let cmd = `curl -X ${ep.method} ${url}`;
    cmd += ` \\\n  -H "Content-Type: application/json"`;
    if (ep.authRequired && bearerToken) {
      cmd += ` \\\n  -H "Authorization: Bearer ${bearerToken}"`;
    }
    if ((ep.method === "POST" || ep.method === "PUT") && requestBodyText) {
      const cleanJson = requestBodyText.replace(/\n\s*/g, " ");
      cmd += ` \\\n  -d '${cleanJson}'`;
    }
    return cmd;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(buildCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                Live REST API Playground
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Interactive Endpoint Testing Sandbox</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Test all Project 1 REST endpoints with simulated SQLite persistence, JWT authentication, and instant cURL command generators.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Active Bearer Token:</span>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <code className="text-slate-700 font-mono max-w-[140px] truncate">{bearerToken || "None"}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Endpoint Picker */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 max-h-[680px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Available API Endpoints
          </div>

          {API_ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-slate-900 shadow-2xs font-semibold"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ep.method === "GET" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    ep.method === "POST" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                    ep.method === "PUT" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {ep.method}
                  </span>

                  <div className="flex items-center space-x-1">
                    {ep.authRequired ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center space-x-0.5 font-bold" title="Requires JWT Bearer Auth">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Auth</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center space-x-0.5 font-semibold" title="Public Endpoint">
                        <Unlock className="w-2.5 h-2.5" />
                        <span>Public</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-mono text-xs font-bold text-slate-900 truncate">
                  {ep.path}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {ep.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Request Builder & Response Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Header Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  selectedEndpoint.method === "GET" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  selectedEndpoint.method === "POST" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  selectedEndpoint.method === "PUT" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm font-bold text-slate-900 font-mono">{selectedEndpoint.path}</code>
              </div>

              <button
                onClick={handleExecuteRequest}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">{selectedEndpoint.description}</p>

            {/* Query parameters (if applicable) */}
            {selectedEndpoint.queryParams && (
              <div className="mt-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Query String Parameters
                </label>
                <input
                  type="text"
                  value={queryParamsText}
                  onChange={(e) => setQueryParamsText(e.target.value)}
                  placeholder="e.g. q=keyword or status=pending"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            )}

            {/* Request Body Editor (for POST/PUT) */}
            {(selectedEndpoint.method === "POST" || selectedEndpoint.method === "PUT") && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    JSON Request Body Payload
                  </label>
                  <button
                    onClick={() => setRequestBodyText(selectedEndpoint.requestBody || "{}")}
                    className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Example</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-blue-900 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed"
                />
              </div>
            )}

            {/* Live cURL Command preview */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  <span>Equivalent cURL Command</span>
                </span>
                <button
                  onClick={handleCopyCurl}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied cURL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 p-3.5 rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
                <code>{buildCurlCommand()}</code>
              </pre>
            </div>
          </div>

          {/* Response Inspector Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Server Response</span>
                {responseStatus && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {responseOutput ? "application/json" : "Ready to Send"}
              </span>
            </div>

            <div className="p-4 font-mono text-xs overflow-x-auto min-h-[160px] max-h-[350px]">
              {responseOutput ? (
                <pre className="text-emerald-400 leading-relaxed">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Play className="w-6 h-6 mb-2 opacity-40 text-blue-400" />
                  <p className="text-xs">Click <strong>"Send Request"</strong> above to execute this endpoint</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
