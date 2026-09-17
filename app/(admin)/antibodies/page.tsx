"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { antibodyApi } from "@/lib/api";
import { PageHeader, ConfirmModal, SearchInput, EmptyState } from "@/components/UI";
import ViewModal from "@/components/ViewModal";
import Pagination from "@/components/Pagination";
import type { Antibody } from "@/types";

const PAGE_SIZE = 15;

export default function AntibodiesPage() {
  const [antibodies, setAntibodies] = useState<Antibody[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Antibody | null>(null);
  const [viewTarget, setViewTarget] = useState<Antibody | null>(null);

  const load = () => {
    setLoading(true);
    antibodyApi.getAll().then(setAntibodies).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = antibodies.filter(
    (a) =>
      a.catalogNo.toLowerCase().includes(search.toLowerCase()) ||
      a.productName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await antibodyApi.delete(deleteTarget.catalogNo);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Antibodies"
          subtitle={`${antibodies.length} products in catalog`}
          action={{ label: "Add Antibody", href: "/antibodies/new" }}
          secondaryAction={{ label: "Bulk Upload", href: "/bulk-upload" }}
        />
      </div>

      <div className="flex-shrink-0 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by catalog number or product name..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧬"
          title="No antibodies found"
          description={search ? "Try a different search term" : "Get started by adding your first antibody"}
          action={!search ? { label: "Add Antibody", href: "/antibodies/new" } : undefined}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-brand-navy">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80 w-[50px]"></th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Cat.No</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Product Name</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Host</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Clonality</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Applications</th>
                  <th className="hidden xl:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Reactivity</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((ab) => (
                  <tr key={ab.catalogNo} className="group hover:bg-brand-green/5 transition-colors duration-150">
                    <td className="px-4 py-3.5">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {ab.image ? (
                          <img src={ab.image.split(",")[0].trim()} alt={ab.productName} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand-green">{ab.catalogNo}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-brand-navy text-sm line-clamp-2 group-hover:text-brand-green transition-colors duration-150">{ab.productName}</p>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5">
                      <span className="inline-block rounded-full border border-brand-navy/15 bg-brand-navy/5 px-2.5 py-1 text-[11px] font-medium text-brand-navy">{ab.host}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5 text-sm text-slate-600">{ab.clonality}</td>
                    <td className="hidden lg:table-cell px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {ab.applications.map((app) => (
                          <span key={app} className="inline-block rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-[11px] font-medium text-brand-green">{app}</span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {ab.reactivity.map((react) => (
                          <span key={react} className="inline-block rounded-full border border-brand-navy/15 bg-brand-navy/5 px-2.5 py-1 text-[11px] font-medium text-brand-navy">{react}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewTarget(ab)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-navy hover:bg-brand-navy/10"
                          title="View"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <Link
                          href={`/antibodies/${ab.catalogNo}/edit`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(ab)}
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Antibody"
        message={`Are you sure you want to delete ${deleteTarget?.catalogNo}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ViewModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        product={viewTarget}
        type="antibody"
      />
    </div>
  );
}
