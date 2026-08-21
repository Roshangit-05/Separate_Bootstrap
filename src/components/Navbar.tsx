import React from "react";
import { 
  Code2, 
  BookOpen, 
  Terminal, 
  LayoutDashboard, 
  Database, 
  Download,
  CheckCircle2,
  Server,
  Layers
} from "lucide-react";

export type NavTab = "explorer" | "guide" | "sandbox" | "client-demo" | "schema" | "architecture";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onDownloadAllZip: () => void;
  isZipping: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadAllZip,
  isZipping
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-900 font-bold text-base tracking-tight">
                  TaskSync <span className="text-blue-600 font-medium">Architecture Hub</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>API: Dual-Project</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Project 1: REST API (Flask+SQLite) &bull; Project 2: Web Client (Flask+Bootstrap 5)
              </p>
            </div>
          </div>

          {/* Download Bundle Action */}
          <div className="flex items-center space-x-2">
            <button
              id="download-full-bundle-btn"
              onClick={onDownloadAllZip}
              disabled={isZipping}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition duration-150 disabled:opacity-50 cursor-pointer"
              title="Download full project files as ZIP"
            >
              <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>{isZipping ? "Generating ZIP..." : "Download Full Bundle ZIP"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1.5 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          <button
            id="nav-tab-explorer"
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "explorer"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Full Codebase Explorer</span>
          </button>

          <button
            id="nav-tab-guide"
            onClick={() => setActiveTab("guide")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>12-Step Setup & Deploy Guide</span>
          </button>

          <button
            id="nav-tab-sandbox"
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "sandbox"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive REST API Sandbox</span>
          </button>

          <button
            id="nav-tab-client-demo"
            onClick={() => setActiveTab("client-demo")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "client-demo"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live Project 2 Client Preview</span>
          </button>

          <button
            id="nav-tab-schema"
            onClick={() => setActiveTab("schema")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "schema"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Schema & ERD</span>
          </button>

          <button
            id="nav-tab-architecture"
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "architecture"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>System Architecture Flow</span>
          </button>
        </div>
      </div>
    </header>
  );
};
