"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 bg-brand-navy lg:flex lg:flex-col lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-green/20" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mx-auto flex h-24 w-48 items-center justify-center">
            <Image src="/logo.png" alt="Omnigen" width={192} height={80} className="object-contain" priority />
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white">
            Omnigen Admin
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Manage your catalog of validated research antibodies and quantitative ELISA kits from one place.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {["ISO 9001:2015", "Validated Assays", "Lot Reproducibility"].map((chip) => (
              <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white sm:px-16 lg:px-20">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Image src="/logo.png" alt="Omnigen" width={48} height={20} className="object-contain" />
            <div>
              <h1 className="text-lg font-semibold text-brand-navy">Omnigen</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-gold">Admin Panel</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-navy">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your credentials to access the admin panel</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-colors duration-200 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-gold hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Omnigen Inc. &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
