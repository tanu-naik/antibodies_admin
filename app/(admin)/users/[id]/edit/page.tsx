"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usersApi, type AdminUser } from "@/lib/api";
import { PageHeader } from "@/components/UI";

const ROLE_OPTIONS = ["admin", "editor"];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");

  useEffect(() => {
    usersApi
      .getById(id)
      .then((user: AdminUser) => {
        setName(user.name);
        setUsername(user.username);
        setRole(user.role);
      })
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data: { name: string; username: string; role: string; password?: string } = {
        name,
        username,
        role,
      };
      if (password) data.password = password;
      await usersApi.update(id, data);
      router.push("/users");
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title={`Edit ${name || "User"}`} subtitle="Update user details" />
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="Leave blank to keep current password"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-400">Only fill this in to change the password</p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
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
