"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, StatsCard, ConfirmModal } from "@/components/UI";
import { useToast } from "@/components/Toast";
import {
  quoteRequestApi,
  antibodyApi,
  kitsApi,
  type QuoteRequest,
} from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  Pending: "border-amber-300 bg-amber-100 text-amber-700",
  "In Progress": "border-blue-300 bg-blue-100 text-blue-700",
  Completed: "border-green-300 bg-green-100 text-green-700",
  Rejected: "border-red-300 bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Rejected"] as const;

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ProductInfo {
  image?: string;
  description?: string;
  host?: string;
  reactivity?: string | string[];
  applications?: string | string[];
  researchArea?: string | string[];
  antigen?: string;
  sensitivity?: string;
  range?: string;
}

export default function QuoteRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const [productQuotes, setProductQuotes] = useState<QuoteRequest[]>([]);
  const [productQuoteTotal, setProductQuoteTotal] = useState(0);
  const [customerQuotes, setCustomerQuotes] = useState<QuoteRequest[]>([]);
  const [customerQuoteTotal, setCustomerQuoteTotal] = useState(0);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const q = await quoteRequestApi.getById(id);
      setQuote(q);
      setSelectedStatus(q.status);

      const [prodResult, pqResult, cqResult] = await Promise.allSettled([
        antibodyApi
          .getByCatalogNo(q.catalogNo)
          .catch(() => kitsApi.getByCatalogNo(q.catalogNo)),
        quoteRequestApi.getAll({ catalogNo: q.catalogNo, limit: 100 }),
        quoteRequestApi.getAll({ email: q.email, limit: 100 }),
      ]);

      if (prodResult.status === "fulfilled" && prodResult.value) {
        setProduct(prodResult.value as ProductInfo);
      } else {
        setProductNotFound(true);
      }
      if (pqResult.status === "fulfilled") {
        setProductQuotes(pqResult.value.items);
        setProductQuoteTotal(pqResult.value.total);
      }
      if (cqResult.status === "fulfilled") {
        setCustomerQuotes(cqResult.value.items);
        setCustomerQuoteTotal(cqResult.value.total);
      }

      const quoteProductList: { catalogNo?: string }[] =
        Array.isArray((q as any).products) && (q as any).products.length
          ? (q as any).products
          : [{ catalogNo: q.catalogNo }];
      const uniqueCatalogs = Array.from(
        new Set(quoteProductList.map((p) => p.catalogNo).filter(Boolean))
      ) as string[];
      const countEntries = await Promise.all(
        uniqueCatalogs.map(async (c) => {
          try {
            const r = await quoteRequestApi.getAll({ catalogNo: c, limit: 1 });
            return [c, r.total] as const;
          } catch {
            return [c, 0] as const;
          }
        })
      );
      setProductCounts(Object.fromEntries(countEntries));
    } catch (err: any) {
      setError(err.message || "Failed to load quote request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const confirmStatusChange = async () => {
    if (!quote || selectedStatus === quote.status) {
      setStatusConfirmOpen(false);
      return;
    }
    try {
      await quoteRequestApi.update(quote.id, selectedStatus);
      setQuote({ ...quote, status: selectedStatus });
      setStatusConfirmOpen(false);
      showToast("Status updated", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleStatusSelect = (value: string) => {
    if (value === quote?.status) return;
    setSelectedStatus(value);
    setStatusConfirmOpen(true);
  };

  const relatedProductQuotes = productQuotes.filter((q) => q.id !== id);
  const relatedCustomerQuotes = customerQuotes.filter((q) => q.id !== id);
  const asList = (v?: string | string[]) =>
    Array.isArray(v) ? v.join(", ") : v || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Quote Request" secondaryAction={{ label: "Back to Quote Requests", href: "/quote-requests" }} />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Quote request not found"}
        </div>
      </div>
    );
  }

  const productImage = product?.image?.split(",")[0]?.trim();
  const quoteProducts: { catalogNo: string; productName: string; productType: string }[] =
    Array.isArray((quote as any).products) && (quote as any).products.length
      ? (quote as any).products
      : [
          {
            catalogNo: quote.catalogNo,
            productName: quote.productName,
            productType: quote.productType,
          },
        ];
  const productCount = quoteProducts.length;
  const initials = quote.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Quote Request"
          subtitle={`${quote.catalogNo} — ${quote.productName}`}
          secondaryAction={{ label: "Back", href: "/quote-requests" }}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto pb-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard label="Products in This Quote" value={productCount} icon="🧪" color="green" />
          <StatsCard label={`Requests for ${quote.catalogNo}`} value={productQuoteTotal} icon="📋" color="navy" />
          <StatsCard label={`Requests from ${quote.name}`} value={customerQuoteTotal} icon="👤" color="gold" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">
            {/* User details */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-brand-navy">Customer Details</h2>
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[quote.status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
                  {quote.status}
                </span>
              </div>

              <div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-brand-navy/10 flex items-center justify-center text-sm font-bold text-brand-navy">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-brand-navy">{quote.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
                    <a href={`mailto:${quote.email}`} className="text-brand-green hover:underline">{quote.email}</a>
                    {quote.phone && <span>{quote.phone}</span>}
                    {quote.company && <span>{quote.company}</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="mt-1 text-brand-navy">{quote.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Company</p>
                  <p className="mt-1 text-brand-navy">{quote.company || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Submitted</p>
                  <p className="mt-1 text-brand-navy">{formatDate(quote.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Last Updated</p>
                  <p className="mt-1 text-brand-navy">{formatDate(quote.updatedAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Message</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-brand-navy">{quote.message || "No message provided"}</p>
                </div>
              </div>
            </section>

            {/* Product list in this quote */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-brand-navy">Products in This Quote</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  {productCount} {productCount === 1 ? "product" : "products"}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {quoteProducts.map((qp, idx) => {
                  const isPrimary = qp.catalogNo === quote.catalogNo;
                  const requestCount =
                    productCounts[qp.catalogNo] ??
                    (isPrimary ? productQuoteTotal : 0);
                  return (
                    <div key={`${qp.catalogNo}-${idx}`} className={idx === 0 ? "pb-4" : "py-4"}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {isPrimary && productImage ? (
                            <img src={productImage} alt={qp.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300">🧪</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-green">{qp.catalogNo}</span>
                            <span className="inline-block rounded-full border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium text-brand-green">{qp.productType}</span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {requestCount} {requestCount === 1 ? "request" : "requests"}
                            </span>
                          </div>
                          <p className="mt-1 font-medium text-brand-navy">{qp.productName}</p>
                          {isPrimary &&
                            (product ? (
                              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                {product.host && (
                                  <div><dt className="inline text-slate-400">Host: </dt><dd className="inline text-brand-navy">{product.host}</dd></div>
                                )}
                                {product.reactivity && (
                                  <div><dt className="inline text-slate-400">Reactivity: </dt><dd className="inline text-brand-navy">{asList(product.reactivity)}</dd></div>
                                )}
                                {product.applications && (
                                  <div><dt className="inline text-slate-400">Applications: </dt><dd className="inline text-brand-navy">{asList(product.applications)}</dd></div>
                                )}
                                {product.researchArea && (
                                  <div><dt className="inline text-slate-400">Research Area: </dt><dd className="inline text-brand-navy">{asList(product.researchArea)}</dd></div>
                                )}
                                {product.antigen && (
                                  <div><dt className="inline text-slate-400">Antigen: </dt><dd className="inline text-brand-navy">{product.antigen}</dd></div>
                                )}
                                {product.sensitivity && (
                                  <div><dt className="inline text-slate-400">Sensitivity: </dt><dd className="inline text-brand-navy">{product.sensitivity}</dd></div>
                                )}
                                {product.range && (
                                  <div><dt className="inline text-slate-400">Range: </dt><dd className="inline text-brand-navy">{product.range}</dd></div>
                                )}
                              </dl>
                            ) : (
                              <p className="mt-2 text-sm text-slate-400">
                                {productNotFound ? "Product no longer exists in the catalog." : "Loading product details..."}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Other requests for this product */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-brand-navy">Other Requests for This Product</h2>
                <span className="text-xs font-medium text-slate-400">{productQuoteTotal} total</span>
              </div>
              {relatedProductQuotes.length === 0 ? (
                <p className="text-sm text-slate-500">No other quote requests for {quote.catalogNo}.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {relatedProductQuotes.map((q) => (
                    <li key={q.id}>
                      <Link
                        href={`/quote-requests/${q.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-navy">{q.name} {q.company ? `— ${q.company}` : ""}</p>
                          <p className="truncate text-xs text-slate-500">{q.email}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[q.status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>{q.status}</span>
                          <span className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Other requests from this customer */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-brand-navy">Other Requests from This Customer</h2>
                <span className="text-xs font-medium text-slate-400">{customerQuoteTotal} total</span>
              </div>
              {relatedCustomerQuotes.length === 0 ? (
                <p className="text-sm text-slate-500">No other quote requests from {quote.email}.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {relatedCustomerQuotes.map((q) => (
                    <li key={q.id}>
                      <Link
                        href={`/quote-requests/${q.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-navy">{q.productName}</p>
                          <p className="truncate font-mono text-xs text-brand-green">{q.catalogNo}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[q.status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>{q.status}</span>
                          <span className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Right: status sidebar */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <h2 className="mb-4 text-base font-semibold text-brand-navy">Status</h2>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Current Status</p>
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[quote.status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
                {quote.status}
              </span>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Change Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusSelect(e.target.value)}
                  className={`${inputClass} w-full`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">You will be asked to confirm before it is saved.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-card p-6">
              <h2 className="mb-4 text-base font-semibold text-brand-navy">Quick Actions</h2>
              <div className="space-y-2">
                <a
                  href={`mailto:${quote.email}?subject=${encodeURIComponent(`Quote request for ${quote.catalogNo} — ${quote.productName}`)}`}
                  className="block rounded-lg bg-brand-green px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-gold"
                >
                  Email Customer
                </a>
                <Link
                  href="/quote-requests"
                  className="block rounded-lg border border-brand-navy/20 bg-white px-4 py-2.5 text-center text-sm font-semibold text-brand-navy transition-colors hover:border-brand-green hover:text-brand-green"
                >
                  Back to List
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={statusConfirmOpen}
        title="Change Status"
        message={`Are you sure you want to change the status from "${quote.status}" to "${selectedStatus}"?`}
        confirmLabel="Update Status"
        confirmClassName="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-gold disabled:opacity-50"
        onConfirm={confirmStatusChange}
        onCancel={() => {
          setStatusConfirmOpen(false);
          setSelectedStatus(quote.status);
        }}
      />
    </div>
  );
}
