"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { antibodyApi, uploadApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";
import CertificateForm, { Certificate } from "@/components/CertificateForm";
import RichTextEditor from "@/components/RichTextEditor";
import BlobImage from "@/components/BlobImage";

export default function NewAntibodyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    catalogNo: "",
    productName: "",
    host: "",
    clonality: "Polyclonal",
    applications: "",
    reactivity: "",
    dilution: "",
    immunogen: "",
    observedBand: "",
    geneId: "",
    uniprotId: "",
    image: "",
    productSpecificInfo: "",
    targetInfo: "",
  });

  const [datasheets, setDatasheets] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatasheetAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDatasheets((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleCertSave = (cert: Certificate) => {
    setCertificates((prev) => [...prev, cert]);
    setShowCertForm(false);
  };

  const removeDatasheet = (index: number) => {
    setDatasheets((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();

      fd.append("catalogNo", form.catalogNo);
      fd.append("productName", form.productName);
      fd.append("host", form.host);
      fd.append("clonality", form.clonality);
      fd.append("applications", form.applications);
      fd.append("reactivity", form.reactivity);
      fd.append("dilution", form.dilution);
      fd.append("immunogen", form.immunogen);
      fd.append("observedBand", form.observedBand);
      fd.append("geneId", form.geneId);
      fd.append("uniprotId", form.uniprotId);
      fd.append("productSpecificInfo", form.productSpecificInfo);
      fd.append("targetInfo", form.targetInfo);

      imageFiles.forEach((f) => fd.append("image", f));
      datasheets.forEach((f) => fd.append("datasheets", f));

      const uploadedCertificates = certificates.map((cert) => ({
        lotNo: cert.lotNo,
        certificateType: cert.certificateType,
        date: cert.date,
        catalogNo: cert.catalogNo,
        fileName: cert.fileName,
      }));
      fd.append("certificates", JSON.stringify(uploadedCertificates));
      certificates.forEach((cert) => {
        if (cert.file) fd.append("certificateFiles", cert.file);
      });

      console.log("[Antibody Create] FormData entries:");
      fd.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${String(value).substring(0, 100)}`);
        }
      });

      await antibodyApi.createWithFiles(fd);
      router.push("/antibodies");
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Add New Antibody" subtitle="Fill in the details below" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input label="Catalog Number" name="catalogNo" value={form.catalogNo} onChange={handleChange} required placeholder="e.g. EA056" />
            <Input label="Product Name" name="productName" value={form.productName} onChange={handleChange} required placeholder="Full product name" />
            <Input label="Host" name="host" value={form.host} onChange={handleChange} placeholder="e.g. Rabbit, Mouse" />
            <Select label="Clonality" name="clonality" value={form.clonality} onChange={handleChange} options={["Polyclonal", "Monoclonal", "N/A"]} />
            <Input label="Applications" name="applications" value={form.applications} onChange={handleChange} placeholder="Comma-separated: WB, IHC, IF" />
            <Input label="Reactivity" name="reactivity" value={form.reactivity} onChange={handleChange} placeholder="Comma-separated: Human, Mouse" />
            <Input label="Dilution" name="dilution" value={form.dilution} onChange={handleChange} placeholder="e.g. WB 1:1000" />
            <Input label="Gene ID" name="geneId" value={form.geneId} onChange={handleChange} placeholder="Entrez Gene ID" />
            <Input label="UniProt ID" name="uniprotId" value={form.uniprotId} onChange={handleChange} placeholder="UniProt accession" />
            <Input label="Observed Band" name="observedBand" value={form.observedBand} onChange={handleChange} placeholder="e.g. 55 kDa" />
          </div>
          <div className="mt-5 rounded-md border border-slate-300 bg-white p-3.5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Images</label>
            <div className="rounded-md border border-slate-300 bg-white px-3.5 py-2.5">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    setImageFiles((prev) => [...prev, ...Array.from(files)]);
                  }
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 file:cursor-pointer cursor-pointer"
              />
            </div>
            {imageFiles.length > 0 && (
              <div className={`mt-2 flex flex-wrap gap-3 ${imageFiles.length > 5 ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
                {imageFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative group">
                    <div className="h-20 w-20 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <BlobImage file={file} alt={file.name} className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5">
            <Textarea label="Immunogen" name="immunogen" value={form.immunogen} onChange={handleChange} placeholder="Immunogen description" />
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Info</label>
            <RichTextEditor value={form.targetInfo} onChange={(val) => setForm({ ...form, targetInfo: val })} />
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Specific Info</label>
            <RichTextEditor value={form.productSpecificInfo} onChange={(val) => setForm({ ...form, productSpecificInfo: val })} />
          </div>

          {/* Datasheets */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Datasheets</label>
            <div className="rounded-md border border-slate-300 bg-white px-3.5 py-2.5">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleDatasheetAdd}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 file:cursor-pointer cursor-pointer"
              />
            </div>
            {datasheets.length > 0 && (
              <div className="mt-2 space-y-2">
                {datasheets.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-600 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeDatasheet(i)} className="ml-2 text-red-400 hover:text-red-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Certificates</label>
            <div className="rounded-md border border-slate-300 bg-white">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-sm text-slate-400">{certificates.length > 0 ? `${certificates.length} certificate(s) added` : "No certificates added"}</span>
                {!showCertForm && (
                  <button
                    type="button"
                    onClick={() => setShowCertForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-green/10 px-3 py-1.5 text-xs font-semibold text-brand-green hover:bg-brand-green/20 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add
                  </button>
                )}
              </div>

              {showCertForm && (
                <div className="border-t border-slate-200">
                  <CertificateForm onSave={handleCertSave} initialCatalogNo={form.catalogNo} />
                </div>
              )}

              {certificates.length > 0 && (
                <div className="border-t border-slate-200 p-3.5 space-y-2">
                  {certificates.map((cert, i) => (
                    <div key={`${cert.lotNo}-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">{cert.certificateType}</span>
                        <span className="mx-1.5 text-slate-300">|</span>
                        <span>Lot: {cert.lotNo}</span>
                        {cert.date && (
                          <>
                            <span className="mx-1.5 text-slate-300">|</span>
                            <span>{cert.date}</span>
                          </>
                        )}
                        {cert.fileName && (
                          <span className="ml-1.5 text-slate-400">({cert.fileName})</span>
                        )}
                      </div>
                      <button type="button" onClick={() => removeCertificate(i)} className="ml-2 text-red-400 hover:text-red-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50"
            >
              {uploading ? "Uploading images..." : saving ? "Creating..." : "Create Antibody"}
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

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}