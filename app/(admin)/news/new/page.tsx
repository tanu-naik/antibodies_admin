"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { newsApi, uploadApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";
import BlobImage from "@/components/BlobImage";

export default function NewNewsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: "",
    date: new Date().toISOString().split("T")[0],
    category: "Product Launch",
    title: "",
    excerpt: "",
    content: "",
    image: "",
    imagePage: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadApi.image(imageFile);
        } finally {
          setUploading(false);
        }
      }
      await newsApi.create({ ...form, image: imageUrl, date: new Date(form.date).toISOString() });
      router.push("/news");
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Add News Article" subtitle="Publish a new article" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Slug / ID" name="id" value={form.id} onChange={handleChange} required placeholder="e.g. new-elisa-kit-launch" />
          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
          <Select label="Category" name="category" value={form.category} onChange={handleChange} options={["Product Launch", "Company News"]} />
        </div>
        <div className="mt-5">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="mt-5 rounded-md border border-slate-300 bg-white p-3.5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageFile(file);
            }}
            className="w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-green/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-green hover:file:bg-brand-green/20"
          />
          {imageFile && (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative group">
                <div className="h-20 w-20 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
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
              <span className="text-sm text-slate-500">{imageFile.name}</span>
            </div>
          )}
        </div>
        <div className="mt-5">
          <Input label="Image Attribution URL" name="imagePage" value={form.imagePage} onChange={handleChange} />
        </div>
        <div className="mt-5">
          <Textarea label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} required />
        </div>
        <div className="mt-5">
          <Textarea label="Full Content" name="content" value={form.content} onChange={handleChange} rows={6} required />
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50">
            {uploading ? "Uploading image..." : saving ? "Publishing..." : "Publish Article"}
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

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input {...props} className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea {...props} className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30" />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select {...props} className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
