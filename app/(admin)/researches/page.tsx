"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { kitsApi } from "@/lib/api";
import { PageHeader } from "@/components/UI";

interface Kit {
  id: string;
  catalogNo: string;
  productName: string;
  researchArea: string[];
  productType: string;
  species: string;
  image: string;
}

interface ResearchArea {
  name: string;
  kits: Kit[];
}

export default function ResearchesPage() {
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const kits: Kit[] = await kitsApi.getAll();
        const areaMap = new Map<string, Kit[]>();
        for (const kit of kits) {
          const areas = kit.researchArea || [];
          for (const area of areas) {
            if (!areaMap.has(area)) areaMap.set(area, []);
            areaMap.get(area)!.push(kit);
          }
        }
        const sorted = Array.from(areaMap.entries())
          .map(([name, kits]) => ({ name, kits }))
          .sort((a, b) => b.kits.length - a.kits.length);
        setAreas(sorted);
      } catch {
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);

  const filtered = areas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Researches"
          subtitle={`${areas.length} research areas across all kits`}
        />
      </div>

      <div className="flex-shrink-0 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search research areas..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-brand-navy">No research areas found</h3>
          <p className="mt-1 text-sm text-slate-500">Research areas are extracted from ELISA kits</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((area) => (
              <div
                key={area.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/60 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-brand-navy">{area.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {area.kits.length} {area.kits.length === 1 ? "kit" : "kits"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-xs font-medium text-brand-green">
                    {area.kits.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {area.kits.slice(0, 5).map((kit) => (
                    <Link
                      key={kit.catalogNo}
                      href={`/kits/${kit.catalogNo}/edit`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand-green hover:bg-brand-green/5 hover:text-brand-green"
                    >
                      <span className="font-mono text-brand-green">{kit.catalogNo}</span>
                      <span className="text-slate-400">·</span>
                      <span className="truncate max-w-[120px]">{kit.productName}</span>
                    </Link>
                  ))}
                  {area.kits.length > 5 && (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                      +{area.kits.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
