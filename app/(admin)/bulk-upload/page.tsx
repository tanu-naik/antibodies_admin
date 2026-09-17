"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/UI";
import { bulkApi, type BulkResult } from "@/lib/api";
import { KIT_TYPE_OPTIONS } from "@/types";
import { useToast } from "@/components/Toast";

type UploadType = "antibodies" | "kits" | "news";

const DEFAULT_KIT_TYPE = KIT_TYPE_OPTIONS[0].value;

interface ParsedData {
  items: any[];
  errors: string[];
  headers: string[];
  matchedFields: string[];
  missingFields: string[];
}

function detectSeparator(text: string): string {
  // Sample the first few non-empty lines and pick the separator that is
  // most consistently present across all of them. This is more robust than
  // looking at a single header line, which can be misleading if a header
  // cell happens to contain an extra comma/semicolon/tab.
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length > 0);
  const sample = lines.slice(0, 5);
  const seps: Array<string> = [",", ";", "\t"];
  const scores: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  for (const sep of seps) {
    const re = sep === "\t" ? /\t/g : new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    for (const line of sample) {
      const matches = line.match(re);
      scores[sep] += matches ? matches.length : 0;
    }
  }
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return winner[1] > 0 ? winner[0] : ",";
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Strip UTF-8 BOM if present
  const clean = text.replace(/^\uFEFF/, "");
  const separator = detectSeparator(clean);
  const allLines = clean.split(/\r?\n/);
  // Find first non-empty line as header
  const firstIdx = allLines.findIndex((l) => l.trim().length > 0);
  if (firstIdx === -1 || firstIdx === allLines.length - 1) {
    return { headers: [], rows: [] };
  }
  const headers = allLines[firstIdx]
    .split(separator)
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = allLines
    .slice(firstIdx + 1)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === separator && !inQuotes) { values.push(current.trim()); current = ""; }
        else { current += char; }
      }
      values.push(current.trim());
      return values;
    });
  return { headers, rows };
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[._]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHeaderIndex(headers: string[]): Map<string, string> {
  const idx = new Map<string, string>();
  for (const raw of headers) {
    idx.set(normalizeHeader(raw), raw);
  }
  return idx;
}

function pick(row: Record<string, any>, idx: Map<string, string>, ...aliases: string[]): string {
  for (const a of aliases) {
    const key = idx.get(normalizeHeader(a));
    if (key !== undefined) {
      const v = row[key];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
  }
  return "";
}

function splitMulti(v: string): string[] {
  return (v || "").split(/[;|]/).map((s) => s.trim()).filter(Boolean);
}

const SPECIES_MAP: Record<string, string> = {
  "homo sapiens": "Human",
  "human": "Human",
  "mus musculus": "Mouse",
  "mouse": "Mouse",
  "rattus norvegicus": "Rat",
  "rat": "Rat",
  "ovis aries": "Sheep",
  "sheep": "Sheep",
  "capra aegagrus hircus": "Goat",
  "goat": "Goat",
  "sus scrofa": "Pig",
  "pig": "Pig",
  "porcine": "Pig",
  "equus caballus": "Horse",
  "horse": "Horse",
  "canis lupus familiaris": "Dog",
  "dog": "Dog",
  "bos taurus": "Cow",
  "cow": "Cow",
  "bovine": "Cow",
  "rabbit": "Rabbit",
  "oryctolagus cuniculus": "Rabbit",
  "chicken": "Chicken",
  "gallus gallus": "Chicken",
  "monkey": "Monkey",
  "macaca mulatta": "Monkey",
};

function normalizeSpecies(v: string): string {
  if (!v) return v;
  const trimmed = v.trim();
  // Try exact match first
  const lower = trimmed.toLowerCase();
  if (SPECIES_MAP[lower]) return SPECIES_MAP[lower];
  // Try extracting from parentheses: "Homo sapiens (Human)" → "Human"
  const parenMatch = trimmed.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].trim().toLowerCase();
    if (SPECIES_MAP[inner]) return SPECIES_MAP[inner];
  }
  // Try matching the part before parentheses: "Homo sapiens (Human)" → "Homo sapiens"
  const beforeParen = trimmed.split("(")[0].trim().toLowerCase();
  if (SPECIES_MAP[beforeParen]) return SPECIES_MAP[beforeParen];
  // Return original if no match
  return trimmed;
}

function normalizeSpeciesMulti(v: string): string[] {
  return splitMulti(v).map(normalizeSpecies);
}

const EXPECTED_ANTIBODY_FIELDS = [
  "catalog no", "product name", "host", "clonality", "applications",
  "reactivity", "dilution", "immunogen", "observed band", "gene id",
  "uniprot", "image", "product specific info", "target info",
];

const EXPECTED_KIT_FIELDS = [
  "catalog no", "product name", "reactivity", "species", "size",
  "product type", "assay type", "sensitivity", "standard", "standard curve",
  "detection range", "sample type", "measurement", "assay length",
  "sample volume", "detection wavelength", "lead time", "research area",
  "test principle", "target name", "alternative names", "abbreviation",
  "uniprot id", "protocol link", "bip code", "user price",
  "distributor price", "product file", "image", "image url",
];

function findMatchedAndMissing(idx: Map<string, string>, expected: string[]): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const field of expected) {
    const key = idx.get(field);
    if (key) matched.push(key);
    else missing.push(field);
  }
  return { matched, missing };
}

const CATALOG_ALIASES = [
  "catalog no",
  "catalog no.",
  "catalog number",
  "cat no",
  "cat no.",
  "cat. no",
  "cat. no.",
  "cat no",
  "catalogno",
  "catalog no",
  "catalog",
  "cat #",
  "catalog #",
  "sku",
  "product code",
  "product no",
  "product no.",
  "part number",
];

function headerHasCatalog(headers: string[]): boolean {
  const norm = new Set(headers.map(normalizeHeader));
  return CATALOG_ALIASES.some((a) => norm.has(a));
}

function findCatalogKey(idx: Map<string, string>): string | undefined {
  for (const a of CATALOG_ALIASES) {
    const k = idx.get(a);
    if (k !== undefined) return k;
  }
  return undefined;
}

function csvToAntibodies(text: string): ParsedData {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const items: any[] = [];
  if (headers.length === 0 || rows.length === 0) {
    return { items, errors: ["Could not parse CSV. Check the file encoding (use UTF-8) and separator (comma, semicolon or tab)."], headers: [], matchedFields: [], missingFields: [] };
  }
  if (!headerHasCatalog(headers)) {
    errors.push(`Header row is missing a catalog number column. Detected headers: [${headers.join(", ")}]. Expected one of: catalogNo, Cat. No., Catalog No., SKU, etc.`);
  }
  const idx = buildHeaderIndex(headers);
  const { matched, missing } = findMatchedAndMissing(idx, EXPECTED_ANTIBODY_FIELDS);
  const catalogKey = findCatalogKey(idx);
  const seenCatalogs = new Set<string>();
  rows.forEach((values, i) => {
    const row: any = {};
    headers.forEach((h, j) => { row[h] = values[j] || ""; });
    const rowNum = i + 2;
    const catalogNo = (catalogKey ? String(row[catalogKey] || "").trim() : "").trim();
    if (!catalogNo) { errors.push(`Row ${rowNum}: Missing required field "Catalog No" — this row was skipped`); return; }
    const catUpper = catalogNo.toUpperCase();
    if (seenCatalogs.has(catUpper)) {
      errors.push(`Row ${rowNum} (${catalogNo}): Duplicate catalog number — this row was skipped`);
      return;
    }
    seenCatalogs.add(catUpper);
    const productName = pick(row, idx, "product name", "product", "name");
    if (!productName) errors.push(`Row ${rowNum} (${catalogNo}): Empty "Product name" — will save as empty`);
    const host = pick(row, idx, "host");
    if (!host) errors.push(`Row ${rowNum} (${catalogNo}): Empty "Host" — will save as empty`);
    items.push({
      catalogNo: catalogNo.toUpperCase(),
      productName,
      host,
      clonality: pick(row, idx, "clonality", "clone type") || "Polyclonal",
      applications: splitMulti(pick(row, idx, "applications", "application")),
      reactivity: normalizeSpeciesMulti(pick(row, idx, "reactivity", "reactive species")),
      dilution: pick(row, idx, "dilution", "recommended dilution") || "N/A",
      immunogen: pick(row, idx, "immunogen") || "N/A",
      observedBand: pick(row, idx, "observed band", "observed molecular weight") || "N/A",
      geneId: pick(row, idx, "gene id", "geneid", "gene") || "N/A",
      image: pick(row, idx, "image", "image url"),
      productSpecificInfo: splitMulti(pick(row, idx, "product specific info", "specific info", "product info")),
      targetInfo: pick(row, idx, "target info", "target"),
      uniprotId: pick(row, idx, "uniprot", "uniprot id", "uniprot no", "uniprot no."),
    });
  });
  return { items, errors, headers, matchedFields: matched, missingFields: missing };
}

function csvToKits(text: string, defaultProductType: string): ParsedData {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const items: any[] = [];
  if (headers.length === 0 || rows.length === 0) {
    return { items, errors: ["Could not parse CSV. Check the file encoding (use UTF-8) and separator (comma, semicolon or tab)."], headers: [], matchedFields: [], missingFields: [] };
  }
  if (!headerHasCatalog(headers)) {
    errors.push(`Header row is missing a catalog number column. Detected headers: [${headers.join(", ")}]. Expected one of: catalogNo, Cat. No., Catalog No., SKU, etc.`);
  }
  const idx = buildHeaderIndex(headers);
  const { matched, missing } = findMatchedAndMissing(idx, EXPECTED_KIT_FIELDS);
  const catalogKey = findCatalogKey(idx);

  // Group rows by catalogNo — merge sizes for same catalog
  const kitMap = new Map<string, { item: any; sizes: Set<string>; rowNums: number[] }>();

  rows.forEach((values, i) => {
    const row: any = {};
    headers.forEach((h, j) => { row[h] = values[j] || ""; });
    const rowNum = i + 2;
    const catalogNo = (catalogKey ? String(row[catalogKey] || "").trim() : "").trim();
    if (!catalogNo) { errors.push(`Row ${rowNum}: Missing required field "Catalog No" — this row was skipped`); return; }
    const catUpper = catalogNo.toUpperCase();
    const rawSize = pick(row, idx, "size", "kit size") || "96T";
    const sizeSet = new Set(rawSize.split(/[;,|]/).map((s: string) => s.trim()).filter(Boolean));

    if (kitMap.has(catUpper)) {
      const existing = kitMap.get(catUpper)!;
      sizeSet.forEach((s) => existing.sizes.add(s));
      existing.rowNums.push(rowNum);
      const e = existing.item;
      if (!e.productName) e.productName = pick(row, idx, "product name", "product", "name", "kit name");
      if (!e.reactivity) e.reactivity = normalizeSpecies(pick(row, idx, "reactivity", "target species", "species"));
      if (!e.species) e.species = normalizeSpecies(pick(row, idx, "species", "reactivity", "target species"));
      const at = pick(row, idx, "assay principle", "assay type", "principle");
      if (at && (!e.assayType || e.assayType === "Sandwich")) e.assayType = at;
      if (!e.sensitivity) e.sensitivity = pick(row, idx, "sensitivity", "sensitivity range");
      if (!e.standard) e.standard = pick(row, idx, "standard", "standard curve");
      if (!e.detectionRange) e.detectionRange = pick(row, idx, "detection range", "range", "assay range");
      if (!e.sampleType) e.sampleType = pick(row, idx, "sample types", "sample type", "sample");
      if (!e.testPrinciple) e.testPrinciple = pick(row, idx, "test principle", "principle");
      if (!e.targetName) e.targetName = pick(row, idx, "target name", "target");
      if (!e.uniprotId) e.uniprotId = pick(row, idx, "uniprot id", "uniprot no", "uniprot no.", "uniprot", "uniprot number");
      if (!e.protocolLink) e.protocolLink = pick(row, idx, "protocol link", "protocol url", "protocol", "pdf", "product link", "productlink");
      if (!e.userPrice) e.userPrice = pick(row, idx, "user price", "userprice", "price");
      if (!e.distributorPrice) e.distributorPrice = pick(row, idx, "distributor price", "distributorprice", "dist price");
      if (!e.productFile) e.productFile = pick(row, idx, "product file", "productfile", "product file?pdf?", "product file?PDF?");
    } else {
      const allowedTypes = KIT_TYPE_OPTIONS.map((o) => o.value);
      const rawProductType = pick(row, idx, "product type", "kit type", "type");
      let productType = rawProductType || defaultProductType;
      if (!allowedTypes.includes(productType)) {
        const principle = pick(row, idx, "assay principle", "assay type", "principle");
        const lower = principle.toLowerCase();
        if (lower.includes("competitive") || lower.includes("indirect")) productType = "C-ELISA";
        else if (lower.includes("sandwich") || lower.includes("quantitative")) productType = "E-ELISA";
        else productType = defaultProductType;
      }
      if (!allowedTypes.includes(productType)) {
        errors.push(`Row ${rowNum} (${catalogNo}): Invalid Product Type "${rawProductType || "(empty)"}" — valid types: ${allowedTypes.join(", ")}`);
        return;
      }
      const productName = pick(row, idx, "product name", "product", "name", "kit name");
      if (!productName) errors.push(`Row ${rowNum} (${catalogNo}): Empty "Product name" — will save as empty`);
      const reactivity = normalizeSpecies(pick(row, idx, "reactivity", "target species", "species"));
      if (!reactivity) errors.push(`Row ${rowNum} (${catalogNo}): Empty "Reactivity" — will save as empty`);

      const item = {
        catalogNo: catUpper,
        bipCode: pick(row, idx, "bip code", "bipcode", "bip no", "bip no."),
        productName,
        reactivity,
        species: normalizeSpecies(pick(row, idx, "species", "reactivity", "target species")),
        size: rawSize,
        productType,
        alternativeNames: splitMulti(pick(row, idx, "alternative names", "alt names", "synonyms")),
        assayType: pick(row, idx, "assay principle", "assay type", "principle") || "Sandwich",
        sensitivity: pick(row, idx, "sensitivity", "sensitivity range"),
        standard: pick(row, idx, "standard", "standard curve"),
        standardCurve: pick(row, idx, "standard curve", "standardcurve", "standard curve image"),
        detectionRange: pick(row, idx, "detection range", "range", "assay range"),
        sampleType: pick(row, idx, "sample types", "sample type", "sample"),
        measurement: pick(row, idx, "measurement", "unit"),
        assayLength: pick(row, idx, "assay time", "assay length", "time", "duration"),
        sampleVolume: pick(row, idx, "sample volume", "volume"),
        detectionWavelength: pick(row, idx, "detection wavelength", "wavelength"),
        leadTime: pick(row, idx, "lead time", "shipping time", "delivery"),
        researchArea: splitMulti(pick(row, idx, "research area", "area", "category")),
        testPrinciple: pick(row, idx, "test principle", "principle"),
        targetName: pick(row, idx, "target name", "target"),
        abbreviation: pick(row, idx, "abbreviation", "abbr", "short name"),
        uniprotId: pick(row, idx, "uniprot id", "uniprot no", "uniprot no.", "uniprot", "uniprot number"),
        protocolLink: pick(row, idx, "protocol link", "protocol url", "protocol", "pdf", "product link", "productlink"),
        userPrice: pick(row, idx, "user price", "userprice", "price"),
        distributorPrice: pick(row, idx, "distributor price", "distributorprice", "dist price"),
        productFile: pick(row, idx, "product file", "productfile", "product file?pdf?", "product file?PDF?"),
        image: pick(row, idx, "image", "image url"),
      };
      kitMap.set(catUpper, { item, sizes: sizeSet, rowNums: [rowNum] });
    }
  });

  kitMap.forEach(({ item, sizes, rowNums }) => {
    item.size = Array.from(sizes).join(",");
    if (rowNums.length > 1) {
      errors.push(`Merged ${rowNums.length} rows for "${item.catalogNo}" → sizes: ${item.size}`);
    }
    items.push(item);
  });

  return { items, errors, headers, matchedFields: matched, missingFields: missing };
}

function csvToNews(text: string): ParsedData {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];
  const items: any[] = [];
  rows.forEach((values, i) => {
    const row: any = {};
    headers.forEach((h, j) => { row[h] = values[j] || ""; });
    if (!row.id) { errors.push(`Row ${i + 2}: Missing id`); return; }
    items.push({
      id: row.id,
      date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      category: row.category || "Company News",
      title: row.title || "",
      excerpt: row.excerpt || "",
      content: row.content || "",
      image: row.image || "",
      imagePage: row.imagePage || "",
    });
  });
  return { items, errors, headers, matchedFields: [], missingFields: [] };
}

const TEMPLATES: Record<UploadType, { label: string; headers: string; example: string }> = {
  antibodies: {
    label: "Antibodies",
    headers: "catalogNo,productName,host,clonality,applications,reactivity,dilution,immunogen,Observed Band,GeneId,UniProt",
    example: 'EA056,Rabbit Anti-Human COX-2 pAb,Rabbit,Polyclonal,WB;IHC;IF,Human,WB 1:1000,Synthetic peptide,55 kDa,9021,Q02454',
  },
  kits: {
    label: "ELISA Kits",
    headers: "bipCode,catalogNo,productName,size,productType,species,sampleTypes,detectionRange,sensitivity,assayType,measurement,assayLength,sampleVolume,detectionWavelength,leadTime,researchArea,targetName,alternativeNames,abbreviation,uniprotId,protocolLink,standardCurve,userPrice,distributorPrice,productFile,image",
    example: '05120100004302,CSB-EL3325HU,Human SARS-CoV-2 N IgG Antibody ELISA Kit,96T,C-ELISA,"Homo sapiens (Human)","serum, plasma",,,"Indirect",,,50-100ul,450 nm,3-5 working days,Infectious Diseases,N,Nucleoprotein,SARS-CoV-2 N Ab (IgG),P0DTC9,https://www.example.com/protocol.pdf,,,$150,$120,https://www.example.com/file.pdf,https://www.example.com/image.png',
  },
  news: {
    label: "News",
    headers: "id,date,category,title,excerpt,content,image,imagePage",
    example: 'new-product-launch,2026-08-28,Product Launch,New product launched,Excerpt text,Full content text,https://...,https://...',
  },
};

export default function BulkUploadPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<UploadType>("antibodies");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [kitType, setKitType] = useState<string>(DEFAULT_KIT_TYPE);
  const fileRef = useRef<HTMLInputElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const actionBarRef = useRef<HTMLDivElement>(null);
  const errorsBoxRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const lastParsedKeyRef = useRef<string>("");
  const lastResultKeyRef = useRef<string>("");

  function detectCsvType(text: string): UploadType {
    const { headers } = parseCSV(text);
    const norm = new Set(headers.map(normalizeHeader));
    const hasHost = norm.has("host") || norm.has("clonality") || norm.has("clone type");
    const hasAssay = norm.has("assay type") || norm.has("assay principle") || norm.has("product type") || norm.has("kit type") || norm.has("sample type");
    const hasTitle = norm.has("title") && norm.has("content");
    if (hasTitle) return "news";
    if (hasAssay && !hasHost) return "kits";
    if (hasHost) return "antibodies";
    return activeTab;
  }

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setParsed(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(text);
      if (f.name.endsWith(".json")) {
        try {
          const json = JSON.parse(text);
          const items = Array.isArray(json) ? json : [json];
          setParsed({ items, errors: [], headers: [], matchedFields: [], missingFields: [] });
        } catch (err: any) {
          setParsed({ items: [], errors: [`JSON parse error: ${err.message}`], headers: [], matchedFields: [], missingFields: [] });
        }
      } else if (f.name.endsWith(".csv")) {
        const detectedType = detectCsvType(text);
        if (detectedType !== activeTab) setActiveTab(detectedType);
        if (detectedType === "antibodies") setParsed(csvToAntibodies(text));
        else if (detectedType === "kits") setParsed(csvToKits(text, kitType));
        else setParsed(csvToNews(text));
      } else {
        setParsed({ items: [], errors: ["Unsupported file type. Use CSV or JSON."], headers: [], matchedFields: [], missingFields: [] });
      }
    };
    reader.readAsText(f);
  }, [activeTab, kitType]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!parsed || parsed.items.length === 0) return;
    setUploading(true);
    try {
      let res: BulkResult;
      if (activeTab === "antibodies") res = await bulkApi.antibodies(parsed.items);
      else if (activeTab === "kits") res = await bulkApi.kits(parsed.items);
      else res = await bulkApi.news(parsed.items);
      setResult(res);
      if (res.status === "ok") {
        showToast(`${res.created} items uploaded successfully`, "success");
      }
    } catch (err: any) {
      setResult({ status: "error", created: 0, errors: [err.message] });
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const t = TEMPLATES[activeTab];
    const blob = new Blob([t.headers + "\n" + t.example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setParsed(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Re-parse existing CSV when kit type dropdown changes (kits tab only)
  useEffect(() => {
    if (activeTab !== "kits" || !preview) return;
    setParsed(csvToKits(preview, kitType));
  }, [kitType, activeTab, preview]);

  // Auto-scroll after parsing: jump to errors if any, otherwise to the action bar.
  useEffect(() => {
    if (!parsed) return;
    const key = `${parsed.items.length}-${parsed.errors.length}-${activeTab}`;
    if (lastParsedKeyRef.current === key) return;
    lastParsedKeyRef.current = key;

    const id = window.setTimeout(() => {
      if (parsed.errors.length > 0 && errorsBoxRef.current) {
        errorsBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (actionBarRef.current) {
        actionBarRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [parsed, activeTab]);

  // Auto-scroll to result after upload completes.
  useEffect(() => {
    if (!result) return;
    const key = `${result.status}-${result.created}-${result.errors.length}`;
    if (lastResultKeyRef.current === key) return;
    lastResultKeyRef.current = key;

    const id = window.setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [result]);

  const tabs: { key: UploadType; label: string; icon: string }[] = [
    { key: "antibodies", label: "Antibodies", icon: "🧬" },
    { key: "kits", label: "ELISA Kits", icon: "🧪" },
    { key: "news", label: "News", icon: "📰" },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader
          title="Bulk Upload"
          subtitle="Import multiple products at once via CSV or JSON"
        />
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 mb-2 flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); reset(); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left: Upload Area */}
        <div ref={leftScrollRef} className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          {/* Template Download */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">Download Template</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Get a CSV template with the correct headers for {TEMPLATES[activeTab].label.toLowerCase()}
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="rounded-lg border border-brand-navy/20 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Kit Type Selector (kits tab only) */}
          {activeTab === "kits" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-brand-navy">Default Kit Type</h3>
              <p className="mt-1 text-xs text-slate-500">
                Applied to all imported kits unless your CSV includes a <code className="rounded bg-slate-100 px-1">productType</code> column.
              </p>
              <div className="mt-3">
                <select
                  value={kitType}
                  onChange={(e) => setKitType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                >
                  {KIT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              file
                ? "border-brand-green bg-brand-green/5"
                : "border-slate-300 bg-white hover:border-brand-green/60 hover:bg-slate-50/60"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-brand-green/10 transition-colors duration-200">
              <svg className="h-6 w-6 text-slate-400 group-hover:text-brand-green transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-navy">
              {file ? file.name : "Drop file here or click to browse"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports CSV, TSV and JSON files
            </p>
          </div>
        </div>

        {/* Right: Preview & Results */}
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div ref={rightScrollRef} className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Parse Status */}
          {parsed && (
            <div className={`rounded-2xl border p-5 shadow-card ${
              parsed.errors.length > 0
                ? "border-red-200 bg-red-50"
                : "border-brand-green/30 bg-brand-green/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  parsed.errors.length > 0 ? "bg-red-100" : "bg-brand-green/10"
                }`}>
                  {parsed.errors.length > 0 ? (
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${parsed.errors.length > 0 ? "text-red-700" : "text-brand-navy"}`}>
                    {parsed.items.length} items ready to upload
                  </p>
                  {parsed.errors.length > 0 && (
                    <p className="text-xs text-red-600">{parsed.errors.length} issues found — review below</p>
                  )}
                </div>
              </div>
              {parsed.errors.length > 0 && (
                <div ref={errorsBoxRef} className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-white/80 p-3 space-y-1">
                  {parsed.errors.map((err, i) => {
                    const isSkipped = err.includes("skipped");
                    const isWarning = err.includes("will save as empty");
                    return (
                      <div key={i} className={`flex items-start gap-2 text-xs ${isSkipped ? "text-red-700 font-medium" : isWarning ? "text-amber-600" : "text-red-600"}`}>
                        <span className="mt-0.5 shrink-0">{isSkipped ? "✕" : isWarning ? "⚠" : "•"}</span>
                        <span>{err}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Detected Headers Info */}
              <div className="mt-3 rounded-lg bg-white/80 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">Detected CSV Headers ({parsed.headers.length}):</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {parsed.headers.map((h, i) => (
                    <span key={i} className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{h}</span>
                  ))}
                </div>
                {parsed.missingFields.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-amber-600 mb-1">Missing Expected Fields ({parsed.missingFields.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {parsed.missingFields.map((f, i) => (
                        <span key={i} className="inline-block rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700">{f}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload Result */}
          {result && (
            <div ref={resultRef} className={`rounded-2xl border p-5 shadow-card ${
              result.errors.length > 0
                ? "border-brand-gold/40 bg-brand-gold/5"
                : "border-brand-green/30 bg-brand-green/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  result.errors.length > 0 ? "bg-brand-gold/10" : "bg-brand-green/10"
                }`}>
                  <svg className={`h-5 w-5 ${result.errors.length > 0 ? "text-brand-gold" : "text-brand-green"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    {result.created} items created successfully
                  </p>
                  {result.errors.length > 0 && (
                    <p className="text-xs text-brand-gold">{result.errors.length} items failed — see details below</p>
                  )}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-white/80 p-3 space-y-1">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                      <span className="mt-0.5 shrink-0">✕</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Preview */}
          {parsed && parsed.items.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-3">
                <h3 className="text-sm font-semibold text-brand-navy">Data Preview</h3>
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {Object.keys(parsed.items[0]).map((key) => (
                        <th key={key} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parsed.items.slice(0, 10).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        {Object.entries(item).map(([key, val], j) => (
                          <td key={j} className="px-3 py-2.5 text-slate-600 max-w-[200px] truncate" title={`${key}: ${String(val)}`}>
                            {Array.isArray(val) ? val.join(", ") : String(val ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.items.length > 10 && (
                  <p className="px-4 py-3 text-center text-xs text-slate-400">
                    ...and {parsed.items.length - 10} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!parsed && !result && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-brand-navy">No file selected</h3>
              <p className="mt-1 text-sm text-slate-500">
                Upload a CSV or JSON file to preview and import
              </p>
            </div>
          )}
          </div>

          {/* Sticky Action Bar — always visible */}
          {parsed && (
            <div ref={actionBarRef} className="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || parsed.items.length === 0}
                  className="flex-1 rounded-lg bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Uploading...
                    </span>
                  ) : (
                    `Upload ${parsed.items.length} ${parsed.items.length === 1 ? "Item" : "Items"}`
                  )}
                </button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-brand-navy/20 bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
