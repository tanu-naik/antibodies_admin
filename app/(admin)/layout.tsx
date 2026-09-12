"use client";

import { Suspense, useEffect } from "react";
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
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur shadow-header">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
              <p className="text-xs font-medium uppercase tracking-widest text-brand-gold">
                Science. Solutions. Impact.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                  {user.name?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name || user.username}</span>
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 py-8 lg:px-8">
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
