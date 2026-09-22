"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, ConfirmModal } from "@/components/UI";
import { useToast } from "@/components/Toast";
import { quoteRequestApi, type QuoteRequest } from "@/lib/api";

const STATUS_OPTIONS = ["all", "Pending", "In Progress", "Completed", "Rejected"] as const;
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

interface StatusChange {
  id: string;
  from: string;
  to: string;
}

function getProductCount(quote: QuoteRequest): number {
  const products = (quote as any).products;
  if (Array.isArray(products)) return products.length;
  return quote.catalogNo || quote.productName ? 1 : 0;
}

export default function QuoteRequestsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<StatusChange | null>(null);
  const [emailFilter, setEmailFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const statusRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (email) setEmailFilter(email);
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params: { page?: number; limit?: number; status?: string; search?: string; email?: string; from?: string; to?: string } = {
        page,
        limit: 20,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchDebounce) params.search = searchDebounce;
      if (emailFilter) params.email = emailFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const data = await quoteRequestApi.getAll(params);
      setQuotes(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      showToast(err.message || "Failed to load quote requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [page, statusFilter, searchDebounce, emailFilter, dateFrom, dateTo]);

  const hasActiveFilters =
    !!searchQuery || statusFilter !== "all" || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setSearchDebounce("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const clearEmailFilter = () => {
    setEmailFilter(null);
    setPage(1);
    window.history.replaceState(null, "", "/quote-requests");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setSearchDebounce(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  };

  const requestStatusChange = (id: string, from: string, to: string) => {
    if (from === to) return;
    setStatusChange({ id, from, to });
  };

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    try {
      await quoteRequestApi.update(statusChange.id, statusChange.to);
      showToast("Status updated", "success");
      setStatusChange(null);
      fetchQuotes();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quote request?")) return;
    try {
      await quoteRequestApi.delete(id);
      showToast("Quote request deleted", "success");
      fetchQuotes();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || "bg-slate-100 text-slate-700";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Quote Requests"
          subtitle={emailFilter ? `Quote requests from ${emailFilter}` : "Manage customer quote requests"}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Email filter chip */}
        {emailFilter && (
          <div className="flex-shrink-0 mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1.5 text-xs font-semibold text-brand-green">
              Customer: {emailFilter}
              <button
                type="button"
                onClick={clearEmailFilter}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-green/20"
                title="Clear customer filter"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}
        {/* Filters */}
        <div className="flex-shrink-0 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search catalog no, name, email..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30 sm:min-w-[160px]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </label>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 00-2 2v1h2" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-brand-navy">No quote requests found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-navy">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Catalog No</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Products</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Customer</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Contact</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/80">Status</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-white/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {quotes.map((quote) => {
                        const productCount = getProductCount(quote);
                        return (
                        <tr key={quote.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-bold text-brand-green">{quote.catalogNo}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                              </svg>
                              {productCount} {productCount === 1 ? "product" : "products"}
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3.5">
                            <p className="font-medium text-brand-navy text-sm">{quote.name}</p>
                            {quote.company && <p className="text-xs text-slate-500">{quote.company}</p>}
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3.5 text-sm text-slate-600">
                            <a href={`mailto:${quote.email}`} className="text-brand-green hover:underline">{quote.email}</a>
                            {quote.phone && <p className="text-xs text-slate-500">{quote.phone}</p>}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3.5 text-sm text-slate-600">
                            {new Date(quote.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3.5" ref={openStatusId === quote.id ? statusRef : undefined}>
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() => setOpenStatusId(openStatusId === quote.id ? null : quote.id)}
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(quote.status)}`}
                              >
                                {quote.status}
                                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                              </button>
                              {openStatusId === quote.id && (
                                <div className="absolute z-50 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                  {(["Pending", "In Progress", "Completed", "Rejected"] as const).map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => { setOpenStatusId(null); requestStatusChange(quote.id, quote.status, s); }}
                                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 ${quote.status === s ? "text-brand-green" : "text-slate-700"}`}
                                    >
                                      <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(s).split(" ")[0]}`} />
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/quote-requests/${quote.id}`)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-brand-green hover:bg-brand-green/10"
                                title="View Details"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(quote.id)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-green hover:text-brand-green"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-green hover:text-brand-green"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!statusChange}
        title="Change Status"
        message={`Are you sure you want to change the status of this quote request from "${statusChange?.from}" to "${statusChange?.to}"?`}
        confirmLabel="Update Status"
        confirmClassName="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-gold disabled:opacity-50"
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusChange(null)}
      />
    </div>
  );
}
