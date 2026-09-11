"use client";

import type { Antibody, ElisaKit } from "@/types";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Antibody | ElisaKit | null;
  type: "antibody" | "kit";
}

export default function ViewModal({ isOpen, onClose, product, type }: ViewModalProps) {
  if (!isOpen || !product) return null;

  const isAntibody = type === "antibody";
  const ab = product as Antibody;
  const kit = product as ElisaKit;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[5vh] overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-4xl flex flex-col rounded-2xl bg-white shadow-2xl mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">
              {isAntibody ? "Antibody Details" : "Kit Details"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{product.catalogNo}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isAntibody ? (
            <AntibodyContent ab={ab} />
          ) : (
            <KitContent kit={kit} />
          )}

          {/* Certificates */}
          {product.certificates && product.certificates.length > 0 && (
            <div>
              <SectionTitle title="Certificates" />
              <div className="space-y-2">
                {product.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10">
                        <svg className="h-4 w-4 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-navy">{cert.certificateType}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Lot: {cert.lotNo}
                          {cert.date && <span className="ml-2">| Date: {cert.date}</span>}
                          {cert.catalogNo && <span className="ml-2">| Cat#: {cert.catalogNo}</span>}
                        </p>
                      </div>
                    </div>
                    {cert.fileName && (
                      <span className="text-xs text-slate-400">{cert.fileName}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-5 w-1 rounded-full bg-brand-green" />
      <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-2">
      <span className="w-44 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-brand-navy break-words">{value}</span>
    </div>
  );
}

function FieldRowWide({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <span className="block text-sm text-slate-500 mb-1">{label}</span>
      <p className="text-sm font-medium text-brand-navy leading-relaxed">{value}</p>
    </div>
  );
}

function AntibodyContent({ ab }: { ab: Antibody }) {
  return (
    <>
      <div>
        <SectionTitle title="Basic Information" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 divide-y divide-slate-100">
          <FieldRow label="Catalog No" value={ab.catalogNo} />
          <FieldRow label="Product Name" value={ab.productName} />
          <FieldRow label="Host" value={ab.host} />
          <FieldRow label="Clonality" value={ab.clonality} />
          <FieldRow label="Applications" value={ab.applications.join(", ")} />
          <FieldRow label="Reactivity" value={ab.reactivity.join(", ")} />
          <FieldRow label="Dilution" value={ab.dilution} />
          <FieldRow label="Gene ID" value={ab.geneId} />
          <FieldRow label="UniProt ID" value={ab.uniprotId} />
          {ab.image && (
            <div className="flex items-start gap-4 py-2">
              <span className="w-44 shrink-0 text-sm text-slate-500">Images</span>
              <div className="flex flex-wrap gap-2">
                {ab.image.split(",").filter(Boolean).map((src, i) => (
                  <img key={i} src={src.trim()} alt={`${ab.productName} ${i + 1}`} className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionTitle title="Immunogen" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
          <FieldRowWide label="Immunogen" value={ab.immunogen} />
        </div>
      </div>

      <div>
        <SectionTitle title="Target Information" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
          <FieldRowWide label="Target Info" value={ab.targetInfo} />
        </div>
      </div>

      <div>
        <SectionTitle title="Product Specific Information" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
          <FieldRowWide label="Details" value={ab.productSpecificInfo.join(" ")} />
        </div>
      </div>
    </>
  );
}

function KitContent({ kit }: { kit: ElisaKit }) {
  return (
    <>
      <div>
        <SectionTitle title="Basic Information" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 divide-y divide-slate-100">
          <FieldRow label="BIP Code" value={kit.bipCode} />
          <FieldRow label="Catalog No" value={kit.catalogNo} />
          <FieldRow label="Product Name" value={kit.productName} />
          <FieldRow label="Size" value={kit.size} />
          <FieldRow label="Product Type" value={kit.productType} />
          <FieldRow label="Species" value={kit.species} />
          <FieldRow label="Reactivity" value={kit.reactivity} />
          <FieldRow label="Alternative Names" value={kit.alternativeNames.join(", ")} />
          <FieldRow label="Target Name" value={kit.targetName} />
          <FieldRow label="Abbreviation" value={kit.abbreviation} />
          <FieldRow label="UniProt ID" value={kit.uniprotId} />
          {kit.image && (
            <div className="flex items-start gap-4 py-2">
              <span className="w-44 shrink-0 text-sm text-slate-500">Image</span>
              <div className="flex flex-wrap gap-2">
                {kit.image.split(",").map((src, i) => (
                  <img key={i} src={src.trim()} alt={`${kit.productName} ${i + 1}`} className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionTitle title="Assay Details" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 divide-y divide-slate-100">
          <FieldRow label="Assay Type" value={kit.assayType} />
          <FieldRow label="Sample Type" value={kit.sampleType} />
          <FieldRow label="Detection Range" value={kit.detectionRange} />
          <FieldRow label="Sensitivity" value={kit.sensitivity} />
          <FieldRow label="Standard" value={kit.standard} />
          <FieldRow label="Measurement" value={kit.measurement} />
          <FieldRow label="Assay Length" value={kit.assayLength} />
          <FieldRow label="Sample Volume" value={kit.sampleVolume} />
          <FieldRow label="Detection Wavelength" value={kit.detectionWavelength} />
          <FieldRow label="Lead Time" value={kit.leadTime} />
          <FieldRow label="Research Area" value={kit.researchArea.join(", ")} />
          <FieldRow label="Protocol Link" value={kit.protocolLink} />
        </div>
      </div>

      <div>
        <SectionTitle title="Test Principle" />
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
          <FieldRowWide label="Principle" value={kit.testPrinciple} />
        </div>
      </div>
    </>
  );
}
