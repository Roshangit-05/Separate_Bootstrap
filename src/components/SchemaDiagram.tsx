import React from "react";
import { Database, Key, Link2, Shield, Layers, Hash } from "lucide-react";

export const SchemaDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
            Relational SQLite Design
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Database Schema & Entity Relationship Diagram</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Project 1 manages `instance/tasks_notes.db` using Flask-SQLAlchemy with strict foreign key constraints, cascade deletions, and indexed lookups.
        </p>
      </div>

      {/* ERD Tables Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Table 1: users */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-bold text-sm text-slate-900">users</span>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 font-mono">
              Table &bull; Primary Entity
            </span>
          </div>

          <div className="p-5 space-y-2 text-xs">
            <div className="grid grid-cols-12 font-bold text-slate-400 pb-1.5 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <span className="col-span-4">Column</span>
              <span className="col-span-4">Type</span>
              <span className="col-span-4 text-right">Attributes</span>
            </div>

            {/* id */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 font-bold text-emerald-700 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>id</span>
              </span>
              <span className="col-span-4 text-slate-600">INTEGER</span>
              <span className="col-span-4 text-right text-[11px] text-amber-700 font-sans font-bold">
                PRIMARY KEY, AUTO
              </span>
            </div>

            {/* name */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">name</span>
              <span className="col-span-4 text-slate-600">VARCHAR(100)</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                NOT NULL
              </span>
            </div>

            {/* email */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">email</span>
              <span className="col-span-4 text-slate-600">VARCHAR(120)</span>
              <span className="col-span-4 text-right text-[11px] text-blue-700 font-sans font-bold">
                UNIQUE, INDEXED
              </span>
            </div>

            {/* password_hash */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold flex items-center space-x-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>password_hash</span>
              </span>
              <span className="col-span-4 text-slate-600">VARCHAR(256)</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                NOT NULL (scrypt/pbkdf2)
              </span>
            </div>

            {/* created_at */}
            <div className="grid grid-cols-12 items-center py-2 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">created_at</span>
              <span className="col-span-4 text-slate-600">DATETIME</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                DEFAULT (UTC NOW)
              </span>
            </div>
          </div>
        </div>

        {/* Table 2: tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-mono font-bold text-sm text-slate-900">tasks</span>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 font-mono">
              Table &bull; Child Entity
            </span>
          </div>

          <div className="p-5 space-y-2 text-xs">
            <div className="grid grid-cols-12 font-bold text-slate-400 pb-1.5 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <span className="col-span-4">Column</span>
              <span className="col-span-4">Type</span>
              <span className="col-span-4 text-right">Attributes</span>
            </div>

            {/* id */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 font-bold text-blue-700 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>id</span>
              </span>
              <span className="col-span-4 text-slate-600">INTEGER</span>
              <span className="col-span-4 text-right text-[11px] text-amber-700 font-sans font-bold">
                PRIMARY KEY, AUTO
              </span>
            </div>

            {/* user_id (FK) */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-emerald-700 flex items-center space-x-1 font-bold">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>user_id</span>
              </span>
              <span className="col-span-4 text-slate-600">INTEGER</span>
              <span className="col-span-4 text-right text-[11px] text-emerald-700 font-sans font-bold">
                FK users(id), CASCADE
              </span>
            </div>

            {/* title */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">title</span>
              <span className="col-span-4 text-slate-600">VARCHAR(200)</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                NOT NULL, INDEXED
              </span>
            </div>

            {/* description */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">description</span>
              <span className="col-span-4 text-slate-600">TEXT</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                NULLABLE
              </span>
            </div>

            {/* category */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">category</span>
              <span className="col-span-4 text-slate-600">VARCHAR(50)</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                DEFAULT 'General'
              </span>
            </div>

            {/* status */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">status</span>
              <span className="col-span-4 text-slate-600">VARCHAR(20)</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                DEFAULT 'pending'
              </span>
            </div>

            {/* created_at */}
            <div className="grid grid-cols-12 items-center py-2 border-b border-slate-100 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">created_at</span>
              <span className="col-span-4 text-slate-600">DATETIME</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                DEFAULT (UTC NOW)
              </span>
            </div>

            {/* updated_at */}
            <div className="grid grid-cols-12 items-center py-2 font-mono">
              <span className="col-span-4 text-slate-900 font-semibold">updated_at</span>
              <span className="col-span-4 text-slate-600">DATETIME</span>
              <span className="col-span-4 text-right text-[11px] text-slate-500 font-sans">
                ON UPDATE (UTC NOW)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship & Security Specification Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Link2 className="w-4 h-4 text-blue-600" />
          <span>Relational Integrity & Data Isolation Rules</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">1-to-Many Relationship</span>
            <p className="text-slate-600 leading-relaxed">
              `User.tasks = db.relationship('Task', backref='owner', cascade='all, delete-orphan')`. Deleting a user automatically cascades and deletes all associated tasks safely.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-blue-700 block mb-1">Strict User Isolation</span>
            <p className="text-slate-600 leading-relaxed">
              Every task query in `app/routes/tasks.py` filters strictly with `Task.user_id == current_user.id`. Users can never read, modify, or delete tasks belonging to other accounts.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-amber-700 block mb-1">Cryptographic Password Storage</span>
            <p className="text-slate-600 leading-relaxed">
              Passwords are never stored in plaintext. `generate_password_hash` hashes passwords with salted scrypt/pbkdf2, verified with `check_password_hash`.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
