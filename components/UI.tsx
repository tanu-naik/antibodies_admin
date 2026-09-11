"use client";

import { useState } from "react";

// ─── Confirm Modal ───────────────────────────
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="text-lg font-semibold tracking-tight text-brand-navy">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-brand-navy/20 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Header ─────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

export function PageHeader({ title, subtitle, action, secondaryAction }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {secondaryAction && (
          <a
            href={secondaryAction.href}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {secondaryAction.label}
          </a>
        )}
        {action && (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {action.label}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Stats Card ──────────────────────────────
interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  color?: "green" | "navy" | "gold";
}

export function StatsCard({ label, value, icon, color = "green" }: StatsCardProps) {
  const colorMap = {
    green: "bg-brand-green/10 text-brand-green",
    navy: "bg-brand-navy/10 text-brand-navy",
    gold: "bg-brand-gold/10 text-brand-gold",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-green">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-brand-navy">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Search Input ────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
    </div>
  );
}

// ─── Empty State ─────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-brand-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-green"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
