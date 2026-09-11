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

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: Certificate) => void;
  initialCatalogNo?: string;
}

export default function CertificateModal({ isOpen, onClose, onSave, initialCatalogNo = "" }: CertificateModalProps) {
  const [lotNo, setLotNo] = useState("");
  const [certificateType, setCertificateType] = useState("CoA");
  const [date, setDate] = useState("");
  const [catalogNo, setCatalogNo] = useState(initialCatalogNo);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-brand-navy">Add Certificate</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Lot No</label>
            <input
              value={lotNo}
              onChange={(e) => setLotNo(e.target.value)}
              placeholder="e.g. LOT2024001"
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Certificate Type</label>
            <select
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="CoA">Certificate of Analysis (CoA)</option>
              <option value="MSDS">MSDS</option>
              <option value="Protocol">Protocol</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Catalog No</label>
            <input
              value={catalogNo}
              onChange={(e) => setCatalogNo(e.target.value)}
              placeholder="e.g. EA056"
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-green/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-brand-green hover:file:bg-brand-green/20"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold"
          >
            Add Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
