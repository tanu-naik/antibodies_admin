"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { speciesApi, type Species } from "@/lib/api";
import { PageHeader, ConfirmModal, SearchInput, EmptyState } from "@/components/UI";

const TYPE_FILTERS = ["All", "Antibody", "ELISA", "Both"] as const;

const TYPE_STYLES: Record<string, string> = {
  Antibody: "border-blue-300 bg-blue-100 text-blue-700",
  ELISA: "border-brand-green/30 bg-brand-green/10 text-brand-green",
  Both: "border-brand-gold/30 bg-brand-gold/10 text-brand-gold",
};

export default function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<Species | null>(null);

  const load = () => {
    setLoading(true);
    speciesApi.getAll().then(setSpecies).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = species.filter(
    (s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      if (typeFilter === "All") return matchSearch;
      if (typeFilter === "Both") return matchSearch && (s.type === "Both" || !s.type);
      return matchSearch && s.type === typeFilter;
    }
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await speciesApi.delete(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const countByType = (type: string) => {
    if (type === "All") return species.length;
    if (type === "Both") return species.filter((s) => s.type === "Both" || !s.type).length;
    return species.filter((s) => s.type === type).length;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Species"
          subtitle={`${filtered.length} species`}
          action={{ label: "Add Species", href: "/species/new" }}
        />
      </div>

      <div className="flex-shrink-0 mb-4 space-y-3">
        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                typeFilter === type
                  ? type === "All"
                    ? "border-brand-navy bg-brand-navy text-white shadow-sm"
                    : type === "Antibody"
                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                    : type === "ELISA"
                    ? "border-brand-green bg-brand-green text-white shadow-sm"
                    : "border-brand-gold bg-brand-gold text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {type}
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                typeFilter === type
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {countByType(type)}
              </span>
            </button>
          ))}
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder="Search species..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧬"
          title="No species found"
          description={search ? "Try a different search term" : "Get started by adding your first species"}
          action={!search ? { label: "Add Species", href: "/species/new" } : undefined}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-brand-navy">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 w-[60px]"></th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Used For</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="group hover:bg-brand-green/5 transition-colors duration-150">
                    <td className="px-4 py-3.5">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg text-slate-300">🧬</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-brand-navy">{s.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TYPE_STYLES[s.type] || TYPE_STYLES.Both}`}>
                        {s.type || "Both"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/species/${s.id}/edit`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Species"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
