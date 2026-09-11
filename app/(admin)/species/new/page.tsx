"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { speciesApi, uploadApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";
import BlobImage from "@/components/BlobImage";

const TYPE_OPTIONS = ["Antibody", "ELISA", "Both"];

export default function NewSpeciesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Both"]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      if (type === "Both") return ["Both"];
      const withoutBoth = prev.filter((t) => t !== "Both");
      if (prev.includes(type)) {
        const next = withoutBoth.filter((t) => t !== type);
        return next.length === 0 ? ["Both"] : next;
      }
      return [...withoutBoth, type];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = "";
      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadApi.image(imageFile);
        } finally {
          setUploading(false);
        }
      }
      const typeValue = selectedTypes.includes("Both") ? "Both" : selectedTypes.join(", ");
      await speciesApi.create({ name, image: imageUrl, type: typeValue });
      router.push("/species");
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Add Species" subtitle="Add a new species" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Species Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Human, Mouse, Rat"
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Used For</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedTypes.includes(type)
                      ? "border-brand-green bg-brand-green/10 text-brand-green"
                      : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {selectedTypes.includes(type) && (
                    <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {type}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Select where this species appears</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Species Photo</label>
            <div className="flex items-center justify-between rounded-md border border-slate-300 bg-white px-3.5 py-2.5">
              <span className="text-sm text-slate-400">{imageFile ? imageFile.name : "No image selected"}</span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-brand-green/10 px-3 py-1.5 text-xs font-semibold text-brand-green hover:bg-brand-green/20 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                  e.target.value = "";
                }} />
              </label>
            </div>
            {imageFile && (
              <div className="mt-2 relative group inline-block">
                <div className="h-24 w-24 rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
                  <BlobImage file={imageFile} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
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
              {uploading ? "Uploading image..." : saving ? "Creating..." : "Create Species"}
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
