"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50/40">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur shadow-header">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Open menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                <p className="text-xs font-medium uppercase tracking-widest text-brand-gold hidden sm:block">
                  Science. Solutions. Impact.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                  {user.name?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline truncate max-w-[120px]">{user.name || user.username}</span>
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto mx-auto max-w-7xl w-full px-4 sm:px-6 py-4 sm:py-8 lg:px-8">
            <div className="h-full">
              <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" /></div>}>
                {children}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
