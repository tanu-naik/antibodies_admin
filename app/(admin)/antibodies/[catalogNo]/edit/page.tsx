"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { antibodyApi, uploadApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";
import CertificateForm, { Certificate } from "@/components/CertificateForm";
import BlobImage from "@/components/BlobImage";

export default function EditAntibodyPage() {
  const router = useRouter();
  const params = useParams();
  const catalogNo = params.catalogNo as string;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingDatasheets, setExistingDatasheets] = useState<string[]>([]);
  const [datasheetFiles, setDatasheetFiles] = useState<File[]>([]);
  const [existingCertificates, setExistingCertificates] = useState<Certificate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);


  useEffect(() => {
    antibodyApi.getByCatalogNo(catalogNo).then((ab) => {
      if (!ab) { setError("Antibody not found"); return; }
      setForm({
        productName: ab.productName,
        host: ab.host,
        clonality: ab.clonality,
        applications: ab.applications.join(", "),
        reactivity: ab.reactivity.join(", "),
        dilution: ab.dilution,
        immunogen: ab.immunogen,
        observedBand: ab.observedBand,
        geneId: ab.geneId,
        uniprotId: ab.uniprotId,
        image: ab.image,
        productSpecificInfo: ab.productSpecificInfo.join("\n"),
        targetInfo: ab.targetInfo,
      });
      setExistingDatasheets(ab.datasheets || []);
      setExistingCertificates((ab.certificates || []).map((c: any) => ({
        lotNo: c.lotNo,
        certificateType: c.certificateType,
        date: c.date,
        catalogNo: c.catalogNo,
        file: null,
        fileName: c.fileName || "",
      })));
    }).catch((err) => setError(err.message || "Failed to load")).finally(() => setLoading(false));
  }, [catalogNo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDatasheetAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDatasheetFiles((prev) => [...prev, ...Array.from(files)]);
    }
    e.target.value = "";
  };

  const handleCertSave = (cert: Certificate) => {
    setCertificates((prev) => [...prev, cert]);
    setShowCertForm(false);
  };

  const removeDatasheet = (index: number) => {
    setDatasheetFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDatasheet = (index: number) => {
    setExistingDatasheets((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingCertificate = (index: number) => {
    setExistingCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();

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

      if (imageFiles.length > 0) {
        imageFiles.forEach((f) => fd.append("image", f));
      } else {
        fd.append("image", form.image);
      }

      const allDatasheets = [...existingDatasheets];
      datasheetFiles.forEach((f) => allDatasheets.push(`__NEW__${f.name}`));
      fd.append("datasheets", JSON.stringify(allDatasheets));
      datasheetFiles.forEach((f) => fd.append("datasheets", f));

      const allCertificates = existingCertificates.map((c) => ({
        lotNo: c.lotNo,
        certificateType: c.certificateType,
        date: c.date,
        catalogNo: c.catalogNo,
        fileName: c.fileName,
      }));
      certificates.forEach((c) => allCertificates.push({
        lotNo: c.lotNo,
        certificateType: c.certificateType,
        date: c.date,
        catalogNo: c.catalogNo,
        fileName: c.fileName,
      }));
      fd.append("certificates", JSON.stringify(allCertificates));
      certificates.forEach((c) => {
        if (c.file) fd.append("certificateFiles", c.file);
      });

      await antibodyApi.updateWithFiles(catalogNo, fd);
      router.push("/antibodies");
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setSaving(false);
      setUploading(false);
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
        <PageHeader title={`Edit ${catalogNo}`} subtitle="Update antibody details" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Product Name" name="productName" value={form.productName} onChange={handleChange} required />
          <Input label="Host" name="host" value={form.host} onChange={handleChange} />
          <Select label="Clonality" name="clonality" value={form.clonality} onChange={handleChange} options={["Polyclonal", "Monoclonal", "N/A"]} />
          <Input label="Applications" name="applications" value={form.applications} onChange={handleChange} placeholder="Comma-separated" />
          <Input label="Reactivity" name="reactivity" value={form.reactivity} onChange={handleChange} placeholder="Comma-separated" />
          <Input label="Dilution" name="dilution" value={form.dilution} onChange={handleChange} />
          <Input label="Gene ID" name="geneId" value={form.geneId} onChange={handleChange} />
          <Input label="UniProt ID" name="uniprotId" value={form.uniprotId} onChange={handleChange} />
          <Input label="Observed Band" name="observedBand" value={form.observedBand} onChange={handleChange} />
        </div>
        <div className="mt-5 rounded-md border border-slate-300 bg-white p-3.5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Image</label>
            {form.image && imageFiles.length === 0 && (
              <div className="mb-3">
                <div className="relative inline-block">
                  <img src={form.image} alt="Current" className="h-32 w-32 rounded-lg border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                  >×</button>
                </div>
                <p className="mt-1 text-xs text-slate-400">Current image</p>
              </div>
            )}
            {imageFiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-3">
                  {imageFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="relative group">
                      <BlobImage file={file} alt={file.name} className="h-32 w-32 rounded-lg border border-slate-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >×</button>
                      <p className="mt-1 text-xs text-slate-400 truncate max-w-[128px]">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-green hover:bg-brand-green/5 transition-colors">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span className="text-sm text-slate-500 mt-1">{form.image || imageFiles.length > 0 ? "Replace image" : "Click to upload image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setImageFiles([files[0]]);
                  }
                  e.target.value = "";
                }}
              />
            </label>
        </div>
        <div className="mt-5">
          <Textarea label="Immunogen" name="immunogen" value={form.immunogen} onChange={handleChange} />
        </div>
        <div className="mt-5">
          <Textarea label="Target Info" name="targetInfo" value={form.targetInfo} onChange={handleChange} rows={3} />
        </div>
        <div className="mt-5">
          <Textarea label="Product Specific Info" name="productSpecificInfo" value={form.productSpecificInfo} onChange={handleChange} rows={4} placeholder="One paragraph per line" />
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
          {existingDatasheets.length > 0 && (
            <div className="mt-2 space-y-2">
              {existingDatasheets.map((url, i) => (
                <div key={`existing-ds-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-green hover:underline truncate">{url.split("/").pop()}</a>
                  <button type="button" onClick={() => removeExistingDatasheet(i)} className="ml-2 text-red-400 hover:text-red-600 shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {datasheetFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {datasheetFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-600 truncate">{file.name}</span>
                  <button type="button" onClick={() => removeDatasheet(i)} className="ml-2 text-red-400 hover:text-red-600 shrink-0">
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
              <span className="text-sm text-slate-400">
                {existingCertificates.length + certificates.length > 0
                  ? `${existingCertificates.length + certificates.length} certificate(s)`
                  : "No certificates added"}
              </span>
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
                <CertificateForm onSave={handleCertSave} initialCatalogNo={catalogNo} />
              </div>
            )}

            {existingCertificates.length > 0 && (
              <div className="border-t border-slate-200 p-3.5 space-y-2">
                {existingCertificates.map((cert, i) => (
                  <div key={`existing-cert-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
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
                    </div>
                    <button type="button" onClick={() => removeExistingCertificate(i)} className="ml-2 text-red-400 hover:text-red-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {certificates.length > 0 && (
              <div className="border-t border-slate-200 p-3.5 space-y-2">
                {certificates.map((cert, i) => (
                  <div key={`new-cert-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
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
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50">
            {uploading ? "Uploading images..." : saving ? "Saving..." : "Save Changes"}
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
