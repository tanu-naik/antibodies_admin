"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          !
        </div>
        <h2 className="mt-4 text-xl font-semibold text-brand-navy">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-500">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
