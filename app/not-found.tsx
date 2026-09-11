import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy/5 text-2xl font-bold text-brand-navy">
          404
        </div>
        <h2 className="mt-4 text-xl font-semibold text-brand-navy">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
