"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";

const ROLE_OPTIONS = ["admin", "editor"];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30";

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await usersApi.create({ name, username, password, role });
      router.push("/users");
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Add User" subtitle="Create a new admin panel user" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. jane.doe"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-brand-navy/20 bg-white px-6 py-2.5 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
