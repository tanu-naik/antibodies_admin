"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applicationsApi, type Application } from "@/lib/api";
import { PageHeader, ConfirmModal, SearchInput, EmptyState } from "@/components/UI";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const load = () => {
    setLoading(true);
    applicationsApi.getAll().then(setApplications).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = applications.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await applicationsApi.delete(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Applications"
          subtitle={`${filtered.length} applications`}
          action={{ label: "Add Application", href: "/applications/new" }}
        />
      </div>

      <div className="flex-shrink-0 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search applications..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔬"
          title="No applications found"
          description={search ? "Try a different search term" : "Get started by adding your first application"}
          action={!search ? { label: "Add Application", href: "/applications/new" } : undefined}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-brand-navy">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 w-[60px]"></th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Description</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="group hover:bg-brand-green/5 transition-colors duration-150">
                    <td className="px-4 py-3.5">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {a.icon ? (
                          <img src={a.icon} alt={a.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg text-slate-300">🔬</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-brand-navy">{a.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-500 text-sm">{a.description || "-"}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/applications/${a.id}/edit`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
        title="Delete Application"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}