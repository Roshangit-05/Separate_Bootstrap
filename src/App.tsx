/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { CodeExplorer } from "./components/CodeExplorer";
import { DeploymentGuide } from "./components/DeploymentGuide";
import { ApiSandbox } from "./components/ApiSandbox";
import { ClientPreview } from "./components/ClientPreview";
import { SchemaDiagram } from "./components/SchemaDiagram";
import { ArchitectureView } from "./components/ArchitectureView";
import { downloadProjectZip } from "./utils/zipExport";
import { Server, Globe, Download, CheckCircle, Terminal, Layers } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("explorer");
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadAll = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip("both", "Flask-FullStack-Dual-Project-Bundle");
      setDownloadSuccess("Full Dual-Project Bundle downloaded successfully!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadP1 = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip("backend", "Project-1-Flask-REST-API-Backend");
      setDownloadSuccess("Project 1 (Backend) ZIP downloaded!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadP2 = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip("client", "Project-2-Flask-Bootstrap-Client");
      setDownloadSuccess("Project 2 (Client) ZIP downloaded!");
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadAllZip={handleDownloadAll}
        isZipping={isZipping}
      />

      {/* Optional Success Notification Bar */}
      {downloadSuccess && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold py-2.5 px-4 text-center flex items-center justify-center space-x-2 shadow-xs">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "explorer" && (
          <CodeExplorer
            onDownloadProject1Zip={handleDownloadP1}
            onDownloadProject2Zip={handleDownloadP2}
          />
        )}

        {activeTab === "guide" && <DeploymentGuide />}

        {activeTab === "sandbox" && <ApiSandbox />}

        {activeTab === "client-demo" && <ClientPreview />}

        {activeTab === "schema" && <SchemaDiagram />}

        {activeTab === "architecture" && <ArchitectureView />}
      </main>

      {/* Footer with Bento Grid Quick Reference */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 text-emerald-700 font-medium">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project 1: REST API (Port 5000 / Render)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 text-blue-700 font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Project 2: Web Client (Port 5001)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span>Flask &bull; SQLite &bull; SQLAlchemy &bull; JWT &bull; Bootstrap 5 &bull; Render</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

