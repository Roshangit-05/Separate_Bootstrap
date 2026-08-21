import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  AlertTriangle, 
  HelpCircle,
  Server,
  Cloud,
  Globe,
  FileText,
  Package,
  Layers,
  ChevronRight
} from "lucide-react";
import { TWELVE_STEPS } from "../data/guideSteps";

export const DeploymentGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [renderTab, setRenderTab] = useState<"backend" | "client">("backend");

  const toggleStepCompleted = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentStep = TWELVE_STEPS[activeStepIndex];

  const p1Requirements = `Flask==3.0.2\nFlask-SQLAlchemy==3.1.1\nFlask-CORS==4.0.0\nPyJWT==2.8.0\nWerkzeug==3.0.1\npython-dotenv==1.0.1\ngunicorn==21.2.0`;
  const p2Requirements = `Flask==3.0.2\nrequests==2.31.0\npython-dotenv==1.0.1\ngunicorn==21.2.0`;

  return (
    <div className="space-y-6">
      {/* Header Banner & Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                12-Step Master Guide
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Production Setup & Render Deployment</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Follow every step in exact order to build, test locally, push to GitHub, and deploy both projects independently.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Checklist Progress</span>
              <span className="text-sm font-black text-emerald-600">
                {completedSteps.length} of 12 Completed ({Math.round((completedSteps.length / 12) * 100)}%)
              </span>
            </div>
            <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(completedSteps.length / 12) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Render Quick Reference & Requirements Cheatsheet (Bento Box) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Render Web Service Commands & Requirements</h3>
              <p className="text-xs text-slate-500">Exact Build Command, Start Command, and requirements.txt for Render Web Services</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setRenderTab("backend")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                renderTab === "backend"
                  ? "bg-white text-emerald-700 font-bold shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Project 1 (Backend API)</span>
            </button>
            <button
              onClick={() => setRenderTab("client")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                renderTab === "client"
                  ? "bg-white text-blue-700 font-bold shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Project 2 (Web Client)</span>
            </button>
          </div>
        </div>

        {renderTab === "backend" ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Render Settings and Commands */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Service Type</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>Web Service (Python 3)</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Root Directory</span>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    api-backend <span className="text-slate-400 font-sans">(or . if standalone repo)</span>
                  </div>
                </div>
              </div>

              {/* Build Command Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Build Command</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard("pip install -r requirements.txt", "p1-build")}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {copiedIndex === "p1-build" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
                  pip install -r requirements.txt
                </div>
              </div>

              {/* Start Command Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Start Command</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard("gunicorn run:app", "p1-start")}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {copiedIndex === "p1-start" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
                  gunicorn run:app
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Render executes Gunicorn against <code className="font-mono text-slate-700 font-semibold">run.py</code> and binds automatically to Render's internal port.
                </span>
              </div>

              {/* Environment Variables */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2">Required Render Environment Variables:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">FLASK_ENV</span>
                    <span className="text-slate-900 font-bold">production</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">SECRET_KEY</span>
                    <span className="text-slate-900 font-bold">&lt;random-secret-key&gt;</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">JWT_SECRET_KEY</span>
                    <span className="text-slate-900 font-bold">&lt;random-jwt-key&gt;</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">CORS_ORIGINS</span>
                    <span className="text-slate-900 font-bold">*</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: requirements.txt code box */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>api-backend/requirements.txt</span>
                </span>
                <button
                  onClick={() => copyToClipboard(p1Requirements, "p1-req")}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {copiedIndex === "p1-req" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy requirements.txt</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-slate-800 leading-relaxed overflow-x-auto shadow-sm">
                {p1Requirements}
              </pre>
              <span className="text-[11px] text-slate-500 block">
                Includes Flask, SQLAlchemy, CORS, PyJWT, Werkzeug password security, and Gunicorn production WSGI server.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Render Settings and Commands for Client */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Service Type</span>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <span>Web Service (Python 3)</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Root Directory</span>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    api-client <span className="text-slate-400 font-sans">(or . if standalone repo)</span>
                  </div>
                </div>
              </div>

              {/* Build Command Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Build Command</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard("pip install -r requirements.txt", "p2-build")}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {copiedIndex === "p2-build" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-xs text-blue-400 border border-slate-800">
                  pip install -r requirements.txt
                </div>
              </div>

              {/* Start Command Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Start Command</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard("gunicorn app:app", "p2-start")}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {copiedIndex === "p2-start" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-xs text-blue-400 border border-slate-800">
                  gunicorn app:app
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Render executes Gunicorn against <code className="font-mono text-slate-700 font-semibold">app.py</code> and serves the Jinja2 / Bootstrap frontend.
                </span>
              </div>

              {/* Environment Variables */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2">Required Render Environment Variables:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">FLASK_ENV</span>
                    <span className="text-slate-900 font-bold">production</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">SECRET_KEY</span>
                    <span className="text-slate-900 font-bold">&lt;random-session-key&gt;</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 sm:col-span-2">
                    <span className="text-slate-500 block text-[10px]">API_BASE_URL</span>
                    <span className="text-blue-700 font-bold">https://your-api.onrender.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: requirements.txt code box */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>api-client/requirements.txt</span>
                </span>
                <button
                  onClick={() => copyToClipboard(p2Requirements, "p2-req")}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {copiedIndex === "p2-req" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy requirements.txt</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 text-blue-400 p-4 rounded-xl font-mono text-xs border border-slate-800 leading-relaxed overflow-x-auto shadow-sm">
                {p2Requirements}
              </pre>
              <span className="text-[11px] text-slate-500 block">
                Includes Flask, requests HTTP library, python-dotenv, and Gunicorn WSGI server. (Zero database packages required!)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Steps List on Left, Active Step Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Step navigation list */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 max-h-[700px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Execution Steps (1 to 12)
          </div>

          {TWELVE_STEPS.map((stepItem, idx) => {
            const isCompleted = completedSteps.includes(stepItem.step);
            const isActive = activeStepIndex === idx;

            return (
              <div
                key={stepItem.step}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isActive
                    ? "bg-blue-50 border-blue-200 text-blue-900 shadow-2xs font-semibold"
                    : isCompleted
                    ? "bg-emerald-50/50 border-emerald-100 text-slate-700 hover:bg-emerald-50"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setActiveStepIndex(idx)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompleted(stepItem.step);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[11px] font-bold ${isActive ? "text-blue-600" : "text-slate-500"}`}>Step {stepItem.step}:</span>
                        <span className="text-xs font-semibold leading-tight line-clamp-1">{stepItem.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{stepItem.targetProject}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Active Step View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-md shadow-xs">
                    Step {currentStep.step} of 12
                  </span>
                  <span className="text-xs font-medium text-slate-500">{currentStep.targetProject}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{currentStep.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{currentStep.subtitle}</p>
              </div>

              <button
                onClick={() => toggleStepCompleted(currentStep.step)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  completedSteps.includes(currentStep.step)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {completedSteps.includes(currentStep.step) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-slate-400" />
                    <span>Mark as Done</span>
                  </>
                )}
              </button>
            </div>

            {/* Explanation */}
            <div className="mt-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentStep.explanation}
            </div>

            {/* Terminal Commands Block */}
            {currentStep.commands && currentStep.commands.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Terminal / Shell Commands</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentStep.commands!.join("\n"), `step-${currentStep.step}`)}
                    className="inline-flex items-center space-x-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    {copiedIndex === `step-${currentStep.step}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Block</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto leading-relaxed shadow-sm">
                  {currentStep.commands.map((cmd, i) => (
                    <div key={i} className="flex items-start space-x-2 py-0.5">
                      <span className="text-slate-500 select-none">$</span>
                      <span className="text-slate-200">{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkpoints & Verification */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  ✅ Success Verification Checkpoints:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentStep.checkpoints.map((cp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-600 mt-0.5 font-bold">&bull;</span>
                      <span>{cp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentStep.tips && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-amber-700 block mb-2 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Important Tips & Caveats:</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {currentStep.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-600 mt-0.5 font-bold">&bull;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Step Navigation buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                &larr; Previous Step
              </button>

              <button
                disabled={activeStepIndex === TWELVE_STEPS.length - 1}
                onClick={() => setActiveStepIndex(Math.min(TWELVE_STEPS.length - 1, activeStepIndex + 1))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition cursor-pointer"
              >
                Next Step ({activeStepIndex + 2} of 12) &rarr;
              </button>
            </div>
          </div>

          {/* Troubleshooting Guide Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Common Issues & Troubleshooting Guide</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1.5">Render Cold Start Timeout (503/504)</div>
                <div className="text-slate-600 leading-relaxed">
                  On Render's free tier, the web service suspends after 15 minutes of inactivity. The initial request takes 30-50s to boot. `api_client.py` has an `API_TIMEOUT=15` or 20 setting to accommodate this gracefully.
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1.5">CORS Blocked in Browser</div>
                <div className="text-slate-600 leading-relaxed">
                  When Project 2 runs in client-side JS or on a separate domain, ensure Project 1's `CORS_ORIGINS` environment variable includes your client URL (or `*`).
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1.5">SQLite Database Missing on Restart</div>
                <div className="text-slate-600 leading-relaxed">
                  Render Web Services have ephemeral disks on free tier. `db.create_all()` in `app/__init__.py` automatically recreates the schema on container boot. For persistent production data, switch `DATABASE_URL` to a hosted PostgreSQL instance.
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1.5">JWT Signature Expired (401)</div>
                <div className="text-slate-600 leading-relaxed">
                  Tokens expire after 24 hours (configurable in `JWT_ACCESS_TOKEN_EXPIRES_HOURS`). When expired, Project 2's `api_client.py` catches 401, clears the session, and redirects to the login screen with a friendly prompt.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
