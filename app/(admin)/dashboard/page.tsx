"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi } from "@/lib/api";
import type { Antibody, ElisaKit } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    antibodyCount: number;
    kitCount: number;
    newsCount: number;
    recentAntibodies: Antibody[];
    recentKits: ElisaKit[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* ─── Hero ────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-navy">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-green/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-brand-navy/30" />
        </div>
        <div className="relative px-8 py-16 sm:px-12 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">
            Antibody Inc.
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Manage your catalog of validated research antibodies and quantitative
            ELISA kits from one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/antibodies"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-brand-gold"
            >
              Browse Antibodies
            </Link>
            <Link
              href="/kits"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:border-white hover:bg-white/20"
            >
              Browse ELISA Kits
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {[
              `${stats.antibodyCount}+ validated antibodies`,
              `${stats.kitCount} quantitative kits`,
              `${stats.newsCount} published articles`,
              "ISO 9001:2015 certified",
            ].map((chip) => (
              <li
                key={chip}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-200"
              >
                <svg
                  className="h-3.5 w-3.5 text-brand-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Category Tiles ──────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/antibodies"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-green/60 hover:shadow-md sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
              Antibodies
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Polyclonal and monoclonal antibodies against validated targets,
              covering WB, IHC, IF, IP, Flow and ELISA applications.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-green">
                {stats.antibodyCount} validated antibodies
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                Browse
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            href="/kits"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-green/60 hover:shadow-md sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v1.5A2.25 2.25 0 0 1 18 9.75H6A2.25 2.25 0 0 1 3.75 7.5V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h12a2.25 2.25 0 0 1 2.25 2.25v1.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25v-1.5Zm0-3A2.25 2.25 0 0 1 6 10.5h12a2.25 2.25 0 0 1 2.25 2.25" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
              ELISA Kits
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Quantitative sandwich and competitive ELISA kits with validated
              sensitivity, precision and recovery.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-green">
                {stats.kitCount} quantitative ELISA kits
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                Browse
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            href="/news"
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-green/60 hover:shadow-md sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
              News &amp; Updates
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Product launches, company announcements and research highlights
              from the Antibody team.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-green">
                {stats.newsCount} published articles
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                Browse
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-brand-green/5 shadow-card sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
            <div className="px-6 py-8 text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
                {stats.antibodyCount}+
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-brand-green">
                Antibodies
              </p>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
                {stats.kitCount}+
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-brand-green">
                ELISA Kits
              </p>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
                {stats.newsCount}
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-brand-green">
                News Articles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About / Quick Actions ───────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
<p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">
              About Antibody
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
              Rigorously validated reagents you can build your research on
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-500">
              Antibody Inc. develops and supplies validated research antibodies
              and quantitative ELISA kits for the global life science community.
              Every reagent is produced to exacting standards — so the data you
              publish today will still be reproducible tomorrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/antibodies"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-green"
              >
                Manage Antibodies
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/kits"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:border-brand-green hover:text-brand-green"
              >
                Manage Kits
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/60 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                  Rigorous quality control
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Every antibody and kit lot is validated for specificity,
                  sensitivity and consistency before it ships — backed by
                  dependable lot-to-lot reproducibility.
                </p>
              </div>
            </div>

            <div className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/60 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v15.75m-1.5-13.5H6.75A2.25 2.25 0 0 0 4.5 7.5v7.5m0 0a2.25 2.25 0 0 0 2.25 2.25h2.25M15 21l-3.75-4.5m0 0L7.5 21m0-9.75h6.75M17.25 21l1.5-4.5 1.5 4.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                  Research-driven coverage
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Targets across oncology, immunology, metabolism, neuroscience
                  and more — with quantitative kits for human, mouse and rat
                  samples.
                </p>
              </div>
            </div>

            <div className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/60 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                  Support that understands science
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Application guidance, assay troubleshooting and responsive
                  service from scientists who speak your language.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Recent Antibodies ───────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-brand-navy">
                Recent Antibodies
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest additions to the antibody catalog.
              </p>
            </div>
            <Link
              href="/antibodies"
              className="text-sm font-semibold text-brand-navy transition-colors duration-200 hover:text-brand-green"
            >
              View all antibodies →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.recentAntibodies.map((ab) => (
              <Link
                key={ab.catalogNo}
                href={`/antibodies/${ab.catalogNo}/edit`}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-green/60 hover:shadow-md"
              >
                <span className="text-xs font-semibold tracking-wide text-brand-green">
                  {ab.catalogNo}
                </span>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                  {ab.productName}
                </h3>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  <span className="rounded-full border border-brand-navy/15 bg-brand-navy/5 px-2 py-0.5 text-[11px] font-medium text-brand-navy">
                    {ab.host}
                  </span>
                  <span className="rounded-full border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[11px] font-medium text-brand-green">
                    {ab.clonality}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Kits ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-navy">
              Recent ELISA Kits
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest additions to the kit catalog.
            </p>
          </div>
          <Link
            href="/kits"
            className="text-sm font-semibold text-brand-navy transition-colors duration-200 hover:text-brand-green"
          >
            View all kits →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.recentKits.map((kit) => (
            <Link
              key={kit.catalogNo}
              href={`/kits/${kit.catalogNo}/edit`}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-green/60 hover:shadow-md"
            >
              <span className="text-xs font-semibold tracking-wide text-brand-green">
                {kit.catalogNo}
              </span>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-brand-navy transition-colors duration-200 group-hover:text-brand-green">
                {kit.productName}
              </h3>
              <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                {kit.researchArea.join(" · ")}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                <span className="rounded-full border border-brand-navy/15 bg-brand-navy/5 px-2 py-0.5 text-[11px] font-medium text-brand-navy">
                  {kit.reactivity}
                </span>
                <span className="rounded-full border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[11px] font-medium text-brand-green">
                  {kit.assayType}
                </span>
                <span className="rounded-full border border-brand-gold/40 bg-brand-gold/10 px-2 py-0.5 text-[11px] font-semibold text-brand-gold">
                  {kit.size}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────── */}
      <section className="bg-brand-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">
              Ready to get started?
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Manage your catalog with confidence
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/antibodies/new"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-brand-gold"
              >
                + Add New Antibody
              </Link>
              <Link
                href="/kits/new"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:border-white hover:bg-white/20"
              >
                + Add New Kit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
