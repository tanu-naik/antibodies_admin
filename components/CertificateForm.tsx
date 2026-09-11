"use client";

import { useState } from "react";

export interface Certificate {
  lotNo: string;
  certificateType: string;
  date: string;
  catalogNo: string;
  file: File | null;
  fileName: string;
}

interface CertificateFormProps {
  onSave: (cert: Certificate) => void;
  initialCatalogNo?: string;
}

export default function CertificateForm({ onSave, initialCatalogNo = "" }: CertificateFormProps) {
  const [lotNo, setLotNo] = useState("");
  const [certificateType, setCertificateType] = useState("CoA");
  const [date, setDate] = useState("");
  const [catalogNo, setCatalogNo] = useState(initialCatalogNo);
  const [file, setFile] = useState<File | null>(null);

  const handleSave = () => {
    onSave({
      lotNo,
      certificateType,
      date,
      catalogNo,
      file,
      fileName: file?.name || "",
    });
    setLotNo("");
    setCertificateType("CoA");
    setDate("");
    setCatalogNo(initialCatalogNo);
    setFile(null);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 mt-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Lot No</label>
          <input
            value={lotNo}
            onChange={(e) => setLotNo(e.target.value)}
            placeholder="e.g. LOT2024001"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Certificate Type</label>
          <select
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          >
            <option value="CoA">CoA</option>
            <option value="MSDS">MSDS</option>
            <option value="Protocol">Protocol</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Catalog No</label>
          <input
            value={catalogNo}
            onChange={(e) => setCatalogNo(e.target.value)}
            placeholder="e.g. EA056"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Upload File</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-brand-green/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-brand-green hover:file:bg-brand-green/20"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-brand-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-gold"
        >
          Add
        </button>
      </div>
    </div>
  );
}
