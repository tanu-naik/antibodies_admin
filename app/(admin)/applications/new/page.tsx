"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applicationsApi, uploadApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";

export default function NewApplicationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let iconUrl = "";
      if (iconFile) {
        setUploading(true);
        try {
          iconUrl = await uploadApi.image(iconFile);
        } finally {
          setUploading(false);
        }
      }
      await applicationsApi.create({ name, description, icon: iconUrl });
      router.push("/applications");
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Add Application" subtitle="Add a new application type" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Application Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. WB, IHC, IF, IP, ELISA"
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this application"
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Icon</label>
            <div className="flex items-center justify-between rounded-md border border-slate-300 bg-white px-3.5 py-2.5">
              <span className="text-sm text-slate-400">{iconFile ? iconFile.name : "No icon selected"}</span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-brand-green/10 px-3 py-1.5 text-xs font-semibold text-brand-green hover:bg-brand-green/20 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setIconFile(file);
                  e.target.value = "";
                }} />
              </label>
            </div>
            {iconFile && (
              <div className="mt-2 relative group inline-block">
                <div className="h-24 w-24 rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
                  <img src={URL.createObjectURL(iconFile)} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setIconFile(null)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50">
              {uploading ? "Uploading icon..." : saving ? "Creating..." : "Create Application"}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-lg border border-brand-navy/20 bg-white px-6 py-2.5 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}