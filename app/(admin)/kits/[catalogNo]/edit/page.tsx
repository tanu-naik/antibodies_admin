"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { kitsApi, uploadApi, speciesApi, type Species } from "@/lib/api";
import { KIT_TYPE_OPTIONS } from "@/types";
import { PageHeader } from "@/components/UI";
import CertificateForm, { Certificate } from "@/components/CertificateForm";
import BlobImage from "@/components/BlobImage";

export default function EditKitPage() {
  const router = useRouter();
  const params = useParams();
  const catalogNo = params.catalogNo as string;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingDatasheets, setExistingDatasheets] = useState<string[]>([]);
  const [datasheetFiles, setDatasheetFiles] = useState<File[]>([]);
  const [existingCertificates, setExistingCertificates] = useState<Certificate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);


  useEffect(() => { speciesApi.getByType("ELISA").then(setSpeciesList).catch(() => {}); }, []);

  const [form, setForm] = useState({
    bipCode: "",
    productName: "",
    reactivity: "",
    size: "96T",
    productType: "",
    species: "",
    alternativeNames: "",
    assayType: "",
    sensitivity: "",
    standard: "",
    detectionRange: "",
    sampleType: "",
    measurement: "",
    assayLength: "",
    sampleVolume: "",
    detectionWavelength: "",
    leadTime: "",
    researchArea: "",
    testPrinciple: "",
    targetName: "",
    abbreviation: "",
    protocolLink: "",
    uniprotId: "",
  });

  useEffect(() => {
    kitsApi.getByCatalogNo(catalogNo).then((kit) => {
      if (!kit) { setError("Kit not found"); return; }
      const imgs = kit.image ? kit.image.split(",").map((s) => s.trim()).filter(Boolean) : [];
      setExistingImages(imgs);
      setExistingDatasheets(kit.datasheets || []);
      setExistingCertificates((kit.certificates || []).map((c: any) => ({
        lotNo: c.lotNo,
        certificateType: c.certificateType,
        date: c.date,
        catalogNo: c.catalogNo,
        file: null,
        fileName: c.fileName || "",
      })));
      setForm({
        bipCode: kit.bipCode,
        productName: kit.productName,
        reactivity: kit.reactivity,
        size: kit.size,
        productType: kit.productType,
        species: kit.species,
        alternativeNames: kit.alternativeNames.join(", "),
        assayType: kit.assayType,
        sensitivity: kit.sensitivity,
        standard: kit.standard,
        detectionRange: kit.detectionRange,
        sampleType: kit.sampleType,
        measurement: kit.measurement,
        assayLength: kit.assayLength,
        sampleVolume: kit.sampleVolume,
        detectionWavelength: kit.detectionWavelength,
        leadTime: kit.leadTime,
        researchArea: kit.researchArea.join(", "),
        testPrinciple: kit.testPrinciple,
        targetName: kit.targetName,
        abbreviation: kit.abbreviation,
        protocolLink: kit.protocolLink,
        uniprotId: kit.uniprotId,
      });
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

      fd.append("bipCode", form.bipCode);
      fd.append("productName", form.productName);
      fd.append("reactivity", form.reactivity);
      fd.append("size", form.size);
      fd.append("productType", form.productType);
      fd.append("species", form.species);
      fd.append("alternativeNames", form.alternativeNames);
      fd.append("assayType", form.assayType);
      fd.append("sensitivity", form.sensitivity);
      fd.append("standard", form.standard);
      fd.append("detectionRange", form.detectionRange);
      fd.append("sampleType", form.sampleType);
      fd.append("measurement", form.measurement);
      fd.append("assayLength", form.assayLength);
      fd.append("sampleVolume", form.sampleVolume);
      fd.append("detectionWavelength", form.detectionWavelength);
      fd.append("leadTime", form.leadTime);
      fd.append("researchArea", form.researchArea);
      fd.append("testPrinciple", form.testPrinciple);
      fd.append("targetName", form.targetName);
      fd.append("abbreviation", form.abbreviation);
      fd.append("protocolLink", form.protocolLink);
      fd.append("uniprotId", form.uniprotId);

      if (imageFiles.length > 0) {
        imageFiles.forEach((f) => fd.append("image", f));
      } else {
        fd.append("image", existingImages.join(", "));
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

      await kitsApi.updateWithFiles(catalogNo, fd);
      router.push("/kits");
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
        <PageHeader title={`Edit ${catalogNo}`} subtitle="Update kit details" />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input label="BIP Code" name="bipCode" value={form.bipCode} onChange={handleChange} />
            <Input label="Product Name" name="productName" value={form.productName} onChange={handleChange} required />
            <Input label="Reactivity" name="reactivity" value={form.reactivity} onChange={handleChange} />
            <Input label="Size" name="size" value={form.size} onChange={handleChange} />
            <Select label="Kit Type" name="productType" value={form.productType} onChange={handleChange} options={KIT_TYPE_OPTIONS.map((o) => o.value)} required />
            <Select label="Species" name="species" value={form.species} onChange={handleChange} options={["", ...speciesList.map((s) => s.name)]} />
            <Input label="Assay Type" name="assayType" value={form.assayType} onChange={handleChange} />
            <Input label="Sensitivity" name="sensitivity" value={form.sensitivity} onChange={handleChange} />
            <Input label="Standard" name="standard" value={form.standard} onChange={handleChange} />
            <Input label="Detection Range" name="detectionRange" value={form.detectionRange} onChange={handleChange} />
            <Input label="Sample Type" name="sampleType" value={form.sampleType} onChange={handleChange} />
            <Input label="Measurement" name="measurement" value={form.measurement} onChange={handleChange} />
            <Input label="Assay Length" name="assayLength" value={form.assayLength} onChange={handleChange} />
            <Input label="Sample Volume" name="sampleVolume" value={form.sampleVolume} onChange={handleChange} />
            <Input label="Detection Wavelength" name="detectionWavelength" value={form.detectionWavelength} onChange={handleChange} />
            <Input label="Lead Time" name="leadTime" value={form.leadTime} onChange={handleChange} />
            <Input label="UniProt ID" name="uniprotId" value={form.uniprotId} onChange={handleChange} />
          </div>
          <div className="mt-5">
            <Input label="Alternative Names" name="alternativeNames" value={form.alternativeNames} onChange={handleChange} placeholder="Comma-separated" />
          </div>
          <div className="mt-5">
            <Input label="Research Area" name="researchArea" value={form.researchArea} onChange={handleChange} placeholder="Comma-separated" />
          </div>
          <div className="mt-5">
            <Input label="Target Name" name="targetName" value={form.targetName} onChange={handleChange} />
          </div>
          <div className="mt-5">
            <Input label="Abbreviation" name="abbreviation" value={form.abbreviation} onChange={handleChange} />
          </div>
          <div className="mt-5">
            <Input label="Protocol Link" name="protocolLink" value={form.protocolLink} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="mt-5">
            <Textarea label="Test Principle" name="testPrinciple" value={form.testPrinciple} onChange={handleChange} rows={4} />
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
                  e.target.value = "";
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 file:cursor-pointer cursor-pointer"
              />
            </div>
            {existingImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {existingImages.map((src, i) => (
                  <div key={`existing-${i}`} className="relative group">
                    <div className="h-20 w-20 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
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
            {imageFiles.length > 0 && (
              <div className={`mt-2 flex flex-wrap gap-3 ${imageFiles.length > 5 ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
                {imageFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative group">
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
