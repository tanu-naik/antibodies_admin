"use client";

import { useEffect, useState } from "react";
import { trustedResearcherApi, type TrustedResearcher } from "@/lib/api";
import { PageHeader, ConfirmModal } from "@/components/UI";
import { useToast } from "@/components/Toast";

export default function TrustedResearchersPage() {
  const { showToast } = useToast();
  const [researchers, setResearchers] = useState<TrustedResearcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TrustedResearcher | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrustedResearcher | null>(null);
  const [form, setForm] = useState({ name: "", role: "", quote: "", initials: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const data = await trustedResearcherApi.getAll();
      setResearchers(data);
    } catch {
      showToast("Failed to load researchers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "", quote: "", initials: "" });
    setShowForm(true);
  };

  const openEdit = (r: TrustedResearcher) => {
    setEditing(r);
    setForm({ name: r.name, role: r.role, quote: r.quote, initials: r.initials });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.quote.trim()) {
      showToast("Name and quote are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await trustedResearcherApi.update(editing.id, form);
        showToast("Researcher updated", "success");
      } else {
        await trustedResearcherApi.create(form);
        showToast("Researcher added", "success");
      }
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await trustedResearcherApi.delete(deleteTarget.id);
      showToast("Researcher deleted", "success");
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const ids = researchers.map((r) => r.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    const reordered = ids.map((id, i) => ({ ...researchers.find((r) => r.id === id)!, sortOrder: i }));
    setResearchers(reordered);
    try {
      await trustedResearcherApi.reorder(ids);
    } catch {
      fetchAll();
    }
  };

  const moveDown = async (index: number) => {
    if (index === researchers.length - 1) return;
    const ids = researchers.map((r) => r.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    const reordered = ids.map((id, i) => ({ ...researchers.find((r) => r.id === id)!, sortOrder: i }));
    setResearchers(reordered);
    try {
      await trustedResearcherApi.reorder(ids);
    } catch {
      fetchAll();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-navy lg:text-3xl">Trusted Researchers</h1>
          <p className="mt-1 text-sm text-slate-500">{researchers.length} testimonials</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90">Add Researcher</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : researchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-brand-navy">No researchers yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add testimonials from trusted researchers</p>
          <button onClick={openCreate} className="mt-4 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90">
            Add Researcher
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-brand-navy">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 whitespace-nowrap">Quote</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {researchers.map((r, i) => (
                  <tr key={r.id} className="group hover:bg-brand-green/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">{r.initials}</span>
                        <span className="font-medium text-brand-navy whitespace-nowrap">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{r.role}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{r.quote}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-brand-green hover:bg-brand-green/10" title="Edit">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(r)} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-brand-navy">{editing ? "Edit Researcher" : "Add Researcher"}</h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" placeholder="Dr. Priya Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" placeholder="Postdoctoral Fellow, Oncology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Quote *</label>
                <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" placeholder="The antibody gave clean, reproducible bands..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Initials</label>
                <input value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" placeholder="PS (auto-generated from name if empty)" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90 disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Researcher"
        message={`Remove "${deleteTarget?.name}" from trusted researchers?`}
      />
    </div>
  );
}
