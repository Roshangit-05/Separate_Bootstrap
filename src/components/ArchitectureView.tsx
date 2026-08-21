import React from "react";
import { 
  Server, 
  Globe, 
  Database, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Cloud,
  Cpu,
  Monitor
} from "lucide-react";

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
            System Design Specification
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Decoupled Microservice & REST Architecture</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Complete structural comparison demonstrating why Project 1 and Project 2 are isolated into two independent repositories and services.
        </p>
      </div>

      {/* Visual Flow Topology */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>End-to-End Data & Authentication Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Node 1: Browser / End User */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-2xs">
            <div className="bg-white text-slate-900 p-3.5 rounded-2xl border border-slate-200 mb-3 shadow-2xs">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">End User Browser</span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">HTML5 / Bootstrap 5 UI</span>
            <div className="mt-4 text-[11px] bg-white text-slate-600 p-3.5 rounded-xl border border-slate-200 w-full text-left leading-relaxed">
              &bull; Submits login/registration forms<br/>
              &bull; Interacts with task dashboard<br/>
              &bull; Holds encrypted session cookie
            </div>
          </div>

          {/* Node 2: Project 2 (Web Client App) */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 flex flex-col items-center text-center relative shadow-2xs">
            <div className="bg-white text-blue-600 p-3.5 rounded-2xl border border-blue-100 mb-3 shadow-2xs">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-blue-900">Project 2: Flask Web Client</span>
            <span className="text-[11px] font-medium text-blue-600 mt-0.5">api-client/ (Port 5001)</span>
            <div className="mt-4 text-[11px] bg-white text-slate-600 p-3.5 rounded-xl border border-blue-100 w-full text-left leading-relaxed">
              &bull; Centralized <code className="text-blue-700 font-mono font-bold">api_client.py</code><br/>
              &bull; Manages Flask user sessions<br/>
              &bull; Injects <code className="text-amber-700 font-mono font-bold">Authorization: Bearer &lt;token&gt;</code><br/>
              &bull; <strong className="text-rose-600">NO direct DB access</strong>
            </div>
          </div>

          {/* Node 3: Project 1 (REST API Backend & SQLite) */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 flex flex-col items-center text-center shadow-2xs">
            <div className="bg-white text-emerald-600 p-3.5 rounded-2xl border border-emerald-100 mb-3 shadow-2xs">
              <Server className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-emerald-900">Project 1: REST API Backend</span>
            <span className="text-[11px] font-medium text-emerald-600 mt-0.5">api-backend/ (Render / Port 5000)</span>
            <div className="mt-4 text-[11px] bg-white text-slate-600 p-3.5 rounded-xl border border-emerald-100 w-full text-left leading-relaxed">
              &bull; Flask + SQLAlchemy + SQLite<br/>
              &bull; JWT verification (<code className="text-emerald-700 font-mono font-bold">@token_required</code>)<br/>
              &bull; Password hashing (Werkzeug)<br/>
              &bull; Queries <code className="text-emerald-700 font-mono font-bold">instance/tasks_notes.db</code>
            </div>
          </div>
        </div>

        {/* Security and Architectural Constraints */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Architectural Best Practices Enforced</span>
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-600 font-bold">&bull;</span>
                <span><strong>Single Source of Truth:</strong> SQLite database is solely owned and modified by Project 1.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-600 font-bold">&bull;</span>
                <span><strong>Stateless Backend:</strong> Project 1 requires no server sessions; every request is authenticated via signed JWT.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-600 font-bold">&bull;</span>
                <span><strong>Independent Deployment:</strong> Either project can be restarted, scaled, or migrated without modifying the other.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-rose-800 flex items-center space-x-1.5 mb-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Strictly Forbidden Anti-Patterns Avoided</span>
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-600 font-bold">&bull;</span>
                <span><strong>No DB Coupling:</strong> Project 2 has NO SQLite database drivers or direct file connections.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-600 font-bold">&bull;</span>
                <span><strong>No Hardcoded Secrets:</strong> All secret keys, API URLs, and ports are injected via `.env`.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-600 font-bold">&bull;</span>
                <span><strong>No Cross-User Leakage:</strong> All tasks strictly enforce `Task.user_id == current_user.id`.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* JWT Authentication Workflow Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>JWT Token Lifecycle & Session Handshake</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-amber-700 font-bold block mb-1.5">1. User Login / Register</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Client POSTs email and password to Project 1 backend `/api/auth/login`.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-amber-700 font-bold block mb-1.5">2. Token Issuance</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Project 1 validates credentials with `check_password_hash` and signs a JWT containing `sub: user.id` and 24h expiration.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-amber-700 font-bold block mb-1.5">3. Session Storage</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Project 2 saves JWT into secure server-side session: `session['jwt_token'] = token`.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-amber-700 font-bold block mb-1.5">4. Authenticated Calls</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              For all subsequent actions, `api_client.py` adds <code className="text-amber-700 font-mono font-bold">Authorization: Bearer &lt;jwt_token&gt;</code> header.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
