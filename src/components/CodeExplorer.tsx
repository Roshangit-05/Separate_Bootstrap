import React, { useState } from "react";
import { 
  Folder, 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Server, 
  Globe, 
  Info,
  ExternalLink
} from "lucide-react";
import { CodeFile } from "../types";
import { PROJECT_1_FILES, PROJECT_2_FILES } from "../data/projectFiles";

interface CodeExplorerProps {
  onDownloadProject1Zip: () => void;
  onDownloadProject2Zip: () => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({
  onDownloadProject1Zip,
  onDownloadProject2Zip
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PROJECT_1_FILES[0]);
  const [activeProjectFilter, setActiveProjectFilter] = useState<"all" | "backend" | "client">("all");
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Overview and ZIP Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Full Source Code Repository</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                100% Real Runnable Code
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Inspect every file for both projects with syntax-highlighted viewers, line numbers, architecture notes, and instant ZIP downloads.
            </p>
          </div>

          {/* Quick ZIP Export buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onDownloadProject1Zip}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project 1 Backend (.ZIP)</span>
            </button>

            <button
              onClick={onDownloadProject2Zip}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project 2 Client (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main File Explorer & Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: File Tree Navigation */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {/* Project Filter Tabs */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">File Navigator</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold">
              <button
                onClick={() => setActiveProjectFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition ${activeProjectFilter === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveProjectFilter("backend")}
                className={`px-2.5 py-1 rounded-lg transition ${activeProjectFilter === "backend" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Project 1
              </button>
              <button
                onClick={() => setActiveProjectFilter("client")}
                className={`px-2.5 py-1 rounded-lg transition ${activeProjectFilter === "client" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Project 2
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {/* Project 1 Backend Section */}
            {(activeProjectFilter === "all" || activeProjectFilter === "backend") && (
              <div>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 mb-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PROJECT 1: REST API (Flask+SQLite)</span>
                </div>
                <div className="space-y-1 pl-1">
                  {PROJECT_1_FILES.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileCode2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                          <span className="truncate">{file.path.replace("api-backend/", "")}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{file.language}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project 2 Client Section */}
            {(activeProjectFilter === "all" || activeProjectFilter === "client") && (
              <div>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 mb-1.5 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-xl">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>PROJECT 2: API CLIENT (Flask+Bootstrap)</span>
                </div>
                <div className="space-y-1 pl-1">
                  {PROJECT_2_FILES.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 border border-blue-200 font-bold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileCode2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                          <span className="truncate">{file.path.replace("api-client/", "")}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{file.language}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Code Display and File Details */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Bar with Filename, Description and Copy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                  selectedFile.project === "backend"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {selectedFile.project === "backend" ? "Project 1" : "Project 2"}
                </span>
                <code className="text-sm font-bold text-slate-900 font-mono">{selectedFile.path}</code>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                  title="Copy file contents"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                  title="Download this file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* File Purpose Note */}
            <div className="mt-3.5 flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{selectedFile.description}</span>
            </div>
          </div>

          {/* Syntax Code Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-slate-300 font-semibold">{selectedFile.name}</span>
              <span className="text-[11px] text-slate-500">{selectedFile.content.split("\n").length} lines &bull; UTF-8</span>
            </div>

            <div className="overflow-x-auto p-4 max-h-[550px] font-mono text-xs text-slate-200 leading-relaxed">
              <pre className="table">
                {selectedFile.content.split("\n").map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-800/50">
                    <span className="table-cell pr-4 select-none text-slate-600 text-right w-10 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre font-mono text-slate-200">
                      {line || " "}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
