import React, { useState } from "react";
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Check, 
  Edit3, 
  Trash2, 
  Tag, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  LogOut, 
  User, 
  X,
  ListTodo,
  Hourglass,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Shield,
  Layers,
  Terminal,
  Activity
} from "lucide-react";
import { TaskItem } from "../types";

export const ClientPreview: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>({
    name: "Alex Rivera",
    email: "alex.rivera@example.com"
  });

  const [activeView, setActiveView] = useState<"dashboard" | "profile" | "login">("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>("Connected to Project 1 REST API on Render (HTTP 200 OK)");

  // Form states for quick task creation
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Development");
  const [newStatus, setNewStatus] = useState<"pending" | "in_progress" | "completed">("pending");

  // Tasks in mock client session
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 101,
      user_id: 1,
      title: "Complete REST API Documentation",
      description: "Document all endpoints: /api/auth/register, /api/auth/login, /api/tasks with sample requests & responses.",
      category: "Development",
      status: "pending",
      created_at: "2026-08-21T02:00:00",
      updated_at: "2026-08-21T02:20:00"
    },
    {
      id: 102,
      user_id: 1,
      title: "Integrate JWT Authentication",
      description: "Implement @token_required decorator on protected Flask API routes and store token in client session.",
      category: "Security",
      status: "completed",
      created_at: "2026-08-20T18:10:00",
      updated_at: "2026-08-21T02:15:00"
    },
    {
      id: 103,
      user_id: 1,
      title: "Deploy SQLite to Render Mount",
      description: "Configure start command to gunicorn run:app and verify instance/tasks_notes.db persistence.",
      category: "DevOps",
      status: "pending",
      created_at: "2026-08-21T01:15:00",
      updated_at: "2026-08-21T01:15:00"
    },
    {
      id: 104,
      user_id: 1,
      title: "Implement Flask-CORS in Backend",
      description: "Allow cross-origin requests from Project 2 client URL to Project 1 backend on Render.",
      category: "Security",
      status: "in_progress",
      created_at: "2026-08-21T00:05:00",
      updated_at: "2026-08-21T02:05:00"
    }
  ]);

  // Derived metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = searchQuery
      ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    const matchesCat = categoryFilter ? t.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleToggleStatus = (taskId: number) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === "completed" ? "pending" : "completed";
        return { ...t, status: nextStatus, updated_at: new Date().toISOString() };
      }
      return t;
    }));
    setNotification("Task status updated via PUT /api/tasks/<id>");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setNotification("Task deleted via DELETE /api/tasks/<id>");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: Math.max(...tasks.map(t => t.id), 100) + 1,
      user_id: 1,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      status: newStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDesc("");
    setIsCreateModalOpen(false);
    setNotification("Task created via POST /api/tasks");
    setTimeout(() => setNotification(null), 3000);
  };

  // Category counts
  const categoryCounts = {
    Development: tasks.filter(t => t.category === "Development").length,
    Security: tasks.filter(t => t.category === "Security").length,
    DevOps: tasks.filter(t => t.category === "DevOps" || t.category === "Work").length,
    General: tasks.filter(t => t.category === "General" || t.category === "Personal").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining client simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                Bento Grid Layout
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Project 2 — TaskSync Client Application</h2>
            </div>
            <p className="text-xs text-slate-500">
              Interactive high-productivity Bento Grid dashboard with instant REST API operations, live status cards, filter chips, and task creation.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Render Backend:</span>
            <span className="text-emerald-700 font-mono font-semibold">https://your-api.onrender.com</span>
          </div>
        </div>
      </div>

      {/* Simulated Browser Frame with Bento Grid */}
      <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-xl border border-slate-200 text-slate-800">
        {/* Mock Browser Titlebar */}
        <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono ml-2">http://127.0.0.1:5001/dashboard</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Project 2 Client Container Preview</div>
        </div>

        {/* TaskSync Pro Bento Header */}
        <nav className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              TaskSync <span className="text-blue-600 font-medium">Pro</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">API: Production</span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pro Plan</p>
                </div>
                <div 
                  onClick={() => setActiveView(activeView === "dashboard" ? "profile" : "dashboard")}
                  className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                  title="Toggle Profile"
                >
                  AR
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setActiveView("login");
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentUser({ name: "Alex Rivera", email: "alex.rivera@example.com" });
                  setActiveView("dashboard");
                }}
                className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Live Notification Bar (Flask flash message simulation) */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Bento Grid Workspace */}
        <div className="p-6 bg-slate-50 min-h-[600px]">
          {activeView === "dashboard" && currentUser && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Bento Card 1: Total Tasks Metric */}
              <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
                  <h2 className="text-4xl font-black text-slate-900">{totalCount}</h2>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <span className="text-emerald-600 text-xs font-bold">+12% this week</span>
                  <div className="w-10 h-6 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Hero Completed Metric (Blue Accent Card) */}
              <div className="md:col-span-3 bg-blue-600 border border-blue-700 rounded-2xl p-5 shadow-lg shadow-blue-200 text-white flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Completed</p>
                  <h2 className="text-4xl font-black">{completedCount}</h2>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-blue-500 rounded-full h-2 mb-1.5">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium">{completionRate}% efficiency rate</p>
                </div>
              </div>

              {/* Bento Card 3: Quick Task Creation Panel */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Quick Task Creation</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                    Direct API POST
                  </span>
                </div>
                <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Review pull request..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                    >
                      <option value="Development">Development</option>
                      <option value="Security">Security</option>
                      <option value="DevOps">DevOps</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Task</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Bento Card 4: Recent Tasks List Tile (Main Central Box) */}
              <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-900 tracking-tight">Active Tasks & Notes</h3>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {filteredTasks.length}
                    </span>
                  </div>

                  {/* Filter & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="pl-7 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none w-36 focus:w-48 transition-all"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                        setCategoryFilter("");
                      }}
                      className="px-3 py-1 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                </div>

                {/* Task Items List */}
                <div className="space-y-2.5 flex-grow">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          task.status === "completed"
                            ? "bg-slate-50 border-slate-200/80"
                            : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 truncate">
                          {/* Checkbox circle/square */}
                          <button
                            onClick={() => handleToggleStatus(task.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center transition cursor-pointer flex-shrink-0 ${
                              task.status === "completed"
                                ? "bg-blue-600 text-white"
                                : "border-2 border-slate-300 hover:border-blue-600 bg-white"
                            }`}
                            title={task.status === "completed" ? "Mark Pending" : "Mark Done"}
                          >
                            {task.status === "completed" && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="truncate">
                            <p className={`text-xs font-bold truncate ${
                              task.status === "completed" ? "line-through text-slate-400" : "text-slate-900"
                            }`}>
                              {task.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Category: <span className="text-blue-600 font-medium">{task.category}</span> &bull; {task.created_at.substring(0, 10)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            task.status === "completed"
                              ? "bg-slate-100 text-slate-500"
                              : task.status === "in_progress"
                              ? "bg-sky-50 text-sky-700 border border-sky-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {task.status}
                          </span>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <ListTodo className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500 font-medium">No tasks found matching criteria.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column Bento Cards */}
              <div className="md:col-span-4 space-y-5">
                {/* Bento Card 5: Dark Session / JWT Token Tile */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Session</p>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-2">
                    <code className="text-[10px] font-mono text-blue-300 break-all">
                      JWT_TOKEN: eyJhbGciOiJIUzI1...
                    </code>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Session authenticated with Render Flask REST API.
                  </p>
                </div>

                {/* Bento Card 6: Category Filter Pills Tile */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Categories</h3>
                    <span 
                      onClick={() => setCategoryFilter("")}
                      className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      {categoryFilter ? "Clear Filter" : "All"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter(categoryFilter === "Development" ? "" : "Development")}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
                        categoryFilter === "Development"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-blue-50 border border-blue-100 text-blue-800 hover:bg-blue-100"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${categoryFilter === "Development" ? "bg-white" : "bg-blue-600"}`}></div>
                      <span>Development</span>
                      <span className={`text-[10px] font-bold ${categoryFilter === "Development" ? "text-blue-100" : "text-blue-400"}`}>
                        {categoryCounts.Development}
                      </span>
                    </button>

                    <button
                      onClick={() => setCategoryFilter(categoryFilter === "Security" ? "" : "Security")}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
                        categoryFilter === "Security"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-purple-50 border border-purple-100 text-purple-800 hover:bg-purple-100"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${categoryFilter === "Security" ? "bg-white" : "bg-purple-600"}`}></div>
                      <span>Security</span>
                      <span className={`text-[10px] font-bold ${categoryFilter === "Security" ? "text-purple-100" : "text-purple-400"}`}>
                        {categoryCounts.Security}
                      </span>
                    </button>

                    <button
                      onClick={() => setCategoryFilter(categoryFilter === "DevOps" ? "" : "DevOps")}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
                        categoryFilter === "DevOps"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-amber-50 border border-amber-100 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${categoryFilter === "DevOps" ? "bg-white" : "bg-amber-600"}`}></div>
                      <span>DevOps</span>
                      <span className={`text-[10px] font-bold ${categoryFilter === "DevOps" ? "text-amber-100" : "text-amber-400"}`}>
                        {categoryCounts.DevOps}
                      </span>
                    </button>

                    <button
                      onClick={() => setCategoryFilter(categoryFilter === "General" ? "" : "General")}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
                        categoryFilter === "General"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${categoryFilter === "General" ? "bg-white" : "bg-slate-400"}`}></div>
                      <span>General</span>
                      <span className={`text-[10px] font-bold ${categoryFilter === "General" ? "text-slate-200" : "text-slate-500"}`}>
                        {categoryCounts.General}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bento Card 7: Server Status & Time */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Server Time (UTC)</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">14:42:01 UTC</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile View */}
          {activeView === "profile" && currentUser && (
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {currentUser.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                  <span className="font-black text-slate-900 text-base">{totalCount}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Completed</span>
                  <span className="font-black text-emerald-700 text-base">{completedCount}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-600 font-bold uppercase block">Pending</span>
                  <span className="font-black text-amber-700 text-base">{pendingCount}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Login View Simulation */}
          {(!currentUser || activeView === "login") && (
            <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 my-8">
              <div className="text-center">
                <h3 className="font-bold text-base text-slate-900">Sign In to TaskSync Pro</h3>
                <p className="text-xs text-slate-500">Project 2 client session authentication</p>
              </div>

              <button
                onClick={() => {
                  setCurrentUser({ name: "Alex Rivera", email: "alex.rivera@example.com" });
                  setActiveView("dashboard");
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-100 cursor-pointer transition"
              >
                Log In as Demo User (Alex Rivera)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

