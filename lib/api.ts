import type { Antibody, ElisaKit, NewsItem } from "@/types";

export interface QuoteRequest {
  id: string;
  catalogNo: string;
  productType: string;
  productName: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequestList {
  items: QuoteRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (e: any) {
    if (e.name === "AbortError") throw new Error("Request timed out. Check if the backend is running.");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (e: any) {
    if (e.name === "AbortError") throw new Error("Request timed out. Check if the backend is running.");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Antibodies ──────────────────────────────
export const antibodyApi = {
  getAll: () => apiFetch<Antibody[]>("/antibodies"),
  getByCatalogNo: (catalogNo: string) =>
    apiFetch<Antibody>(`/antibodies/${catalogNo}`),
  create: (data: any) =>
    apiFetch<Antibody>("/antibodies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createWithFiles: (formData: FormData) =>
    apiUpload<Antibody>("/antibodies", formData),
  update: (catalogNo: string, data: Partial<Antibody>) =>
    apiFetch<Antibody>(`/antibodies/${catalogNo}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateWithFiles: (catalogNo: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    return fetch(`${API_BASE}/antibodies/${catalogNo}`, {
      method: "PUT",
      headers,
      body: formData,
      signal: controller.signal,
    }).then(async (res) => {
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `API error: ${res.status}`);
      }
      return res.json();
    }).catch((e) => {
      clearTimeout(timeout);
      if (e.name === "AbortError") throw new Error("Request timed out. Check if the backend is running.");
      throw e;
    });
  },
  delete: (catalogNo: string) =>
    apiFetch<void>(`/antibodies/${catalogNo}`, { method: "DELETE" }),
};

// ─── Kits ────────────────────────────────────
export const kitsApi = {
  getAll: () => apiFetch<ElisaKit[]>("/kits"),
  getByCatalogNo: (catalogNo: string) =>
    apiFetch<ElisaKit>(`/kits/${catalogNo}`),
  create: (data: any) =>
    apiFetch<ElisaKit>("/kits", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createWithFiles: (formData: FormData) =>
    apiUpload<ElisaKit>("/kits", formData),
  update: (catalogNo: string, data: Partial<ElisaKit>) =>
    apiFetch<ElisaKit>(`/kits/${catalogNo}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateWithFiles: (catalogNo: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    return fetch(`${API_BASE}/kits/${catalogNo}`, {
      method: "PUT",
      headers,
      body: formData,
      signal: controller.signal,
    }).then(async (res) => {
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `API error: ${res.status}`);
      }
      return res.json();
    }).catch((e) => {
      clearTimeout(timeout);
      if (e.name === "AbortError") throw new Error("Request timed out. Check if the backend is running.");
      throw e;
    });
  },
  delete: (catalogNo: string) =>
    apiFetch<void>(`/kits/${catalogNo}`, { method: "DELETE" }),
};

// ─── News ────────────────────────────────────
export const newsApi = {
  getAll: () => apiFetch<NewsItem[]>("/news"),
  getById: (id: string) => apiFetch<NewsItem>(`/news/${id}`),
  create: (data: Omit<NewsItem, "id">) =>
    apiFetch<NewsItem>("/news", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<NewsItem>) =>
    apiFetch<NewsItem>(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/news/${id}`, { method: "DELETE" }),
};

// ─── Upload ─────────────────────────────────
export const uploadApi = {
  image: async (file: File): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      return data.url;
    } catch (e: any) {
      if (e.name === "AbortError") throw new Error("Upload timed out. Check if the backend is running.");
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  },
  images: async (files: File[]): Promise<string[]> => {
    const token = getToken();
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`${API_BASE}/upload/multiple`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      return data.files.map((f: any) => f.url);
    } catch (e: any) {
      if (e.name === "AbortError") throw new Error("Upload timed out. Check if the backend is running.");
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  },
  documents: async (files: File[]): Promise<{ url: string; filename: string }[]> => {
    const token = getToken();
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`${API_BASE}/upload/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      return data.files;
    } catch (e: any) {
      if (e.name === "AbortError") throw new Error("Upload timed out. Check if the backend is running.");
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  },
};

// ─── Dashboard ───────────────────────────────
export const dashboardApi = {
  getStats: async () => {
    const [antibodies, kits, news] = await Promise.all([
      apiFetch<Antibody[]>("/antibodies"),
      apiFetch<ElisaKit[]>("/kits"),
      apiFetch<NewsItem[]>("/news"),
    ]);
    return {
      antibodyCount: antibodies.length,
      kitCount: kits.length,
      newsCount: news.length,
      recentAntibodies: antibodies.slice(-5).reverse(),
      recentKits: kits.slice(-5).reverse(),
    };
  },
};

// ─── Bulk Upload ─────────────────────────────
export interface BulkResult {
  status: string;
  created: number;
  errors: string[];
}

export const bulkApi = {
  antibodies: (items: Omit<Antibody, "id">[]) =>
    apiFetch<BulkResult>("/bulk/antibodies", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  kits: (items: Omit<ElisaKit, "id">[]) =>
    apiFetch<BulkResult>("/bulk/kits", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  news: (items: (Omit<NewsItem, "id"> & { id: string })[]) =>
    apiFetch<BulkResult>("/bulk/news", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
};

// ─── Species ─────────────────────────────────
export interface Species {
  id: string;
  name: string;
  image: string;
  type: string;
}

export const speciesApi = {
  getAll: () => apiFetch<Species[]>("/species"),
  getByType: (type: string) => apiFetch<Species[]>(`/species?type=${encodeURIComponent(type)}`),
  getById: (id: string) => apiFetch<Species>(`/species/${id}`),
  create: (data: { name: string; image?: string; type?: string }) =>
    apiFetch<Species>("/species", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; image?: string; type?: string }) =>
    apiFetch<Species>(`/species/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/species/${id}`, { method: "DELETE" }),
};

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const applicationsApi = {
  getAll: () => apiFetch<Application[]>("/applications"),
  getById: (id: string) => apiFetch<Application>(`/applications/${id}`),
  create: (data: { name: string; description?: string; icon?: string }) =>
    apiFetch<Application>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; description?: string; icon?: string }) =>
    apiFetch<Application>(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/applications/${id}`, { method: "DELETE" }),
};

// ─── Quote Requests ────────────────────────────
export const quoteRequestApi = {
  create: (data: { catalogNo: string; productType: string; productName: string; name: string; email: string; phone?: string; company?: string; message?: string }) =>
    apiFetch<{ status: string; data: QuoteRequest }>("/quote-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.status && params.status !== "all") searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);
    return apiFetch<QuoteRequestList>(`/quote-requests?${searchParams.toString()}`);
  },
  getById: (id: string) => apiFetch<QuoteRequest>(`/quote-requests/${id}`),
  update: (id: string, status: string) =>
    apiFetch<QuoteRequest>(`/quote-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/quote-requests/${id}`, { method: "DELETE" }),
};
