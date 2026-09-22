"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usersApi, type AdminUser, type StoreCustomer } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader, ConfirmModal, SearchInput, EmptyState } from "@/components/UI";

const TABS = ["Admin Users", "Customers"] as const;

const ROLE_STYLES: Record<string, string> = {
  admin: "border-brand-gold/30 bg-brand-gold/10 text-brand-gold",
  editor: "border-blue-300 bg-blue-100 text-blue-700",
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Admin Users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([usersApi.getAll(), usersApi.getCustomers()])
      .then(([u, c]) => {
        setUsers(u);
        setCustomers(c);
      })
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await usersApi.delete(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const subtitle =
    tab === "Admin Users"
      ? `${filteredUsers.length} admin ${filteredUsers.length === 1 ? "user" : "users"}`
      : `${filteredCustomers.length} registered ${filteredCustomers.length === 1 ? "customer" : "customers"}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Users"
          subtitle={subtitle}
          action={tab === "Admin Users" ? { label: "Add User", href: "/users/new" } : undefined}
        />
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                tab === t
                  ? "border-brand-navy bg-brand-navy text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {t}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                tab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {t === "Admin Users" ? users.length : customers.length}
              </span>
            </button>
          ))}
        </div>
        <div className="sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={tab === "Admin Users" ? "Search name, username, or role..." : "Search name, email, or company..."}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : tab === "Admin Users" ? (
        filteredUsers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users found"
            description={search ? "Try a different search term" : "Get started by adding your first user"}
            action={!search ? { label: "Add User", href: "/users/new" } : undefined}
          />
        ) : (
          <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-brand-navy">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Username</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Role</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Joined</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="group hover:bg-brand-green/5 transition-colors duration-150">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-navy/10 flex items-center justify-center text-xs font-bold text-brand-navy">
                              {initials(u.name)}
                            </div>
                            <span className="font-medium text-brand-navy">
                              {u.name}
                              {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{u.username}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${ROLE_STYLES[u.role] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/users/${u.id}/edit`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              disabled={isSelf}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                              title={isSelf ? "You cannot delete your own account" : "Delete"}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="No customers found"
          description={search ? "Try a different search term" : "No one has registered on the website yet"}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-brand-navy">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Company</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Registered</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="group hover:bg-brand-green/5 transition-colors duration-150">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-green/10 flex items-center justify-center text-xs font-bold text-brand-green">
                          {initials(c.name)}
                        </div>
                        <span className="font-medium text-brand-navy">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <a href={`mailto:${c.email}`} className="text-brand-green hover:underline">{c.email}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{c.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{c.company || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => router.push(`/quote-requests?email=${encodeURIComponent(c.email)}`)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                        title="View Quote Requests"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
