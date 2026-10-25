"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  children?: { href: string; label: string }[];
}

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Antibodies",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    children: [
      { href: "/antibodies", label: "E-AB" },
    ],
  },
  {
    href: "/kits",
    label: "ELISA",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    href: "/applications",
    label: "Applications",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  },
  {
    href: "/quote-requests",
    label: "Quote Requests",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 00-2 2v1h2",
  },
  {
    href: "/support-requests",
    label: "Support Requests",
    icon: "M18 8.625c0-2.486-2.014-4.5-4.5-4.5s-4.5 2.014-4.5 4.5c0 .89.26 1.721.707 2.417M18 8.625c0 2.486-2.014 4.5-4.5 4.5-.89 0-1.721-.26-2.417-.707M18 8.625V15m-4.5-6.375V21m-4.5-12.375c0-.89-.26-1.721-.707-2.417M9 8.625c0 2.486-2.014 4.5-4.5 4.5S0 15.611 0 13.125 2.014 8.625 4.5 8.625c.89 0 1.721.26 2.417.707M9 8.625V15m0 0v6m6-12v6",
  },
  {
    href: "/news",
    label: "News",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  },
  {
    href: "/species",
    label: "Species",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    href: "/researches",
    label: "Researches",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  },
  {
    href: "/users",
    label: "Users",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    href: "/trusted-researchers",
    label: "Trusted Researchers",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    if (pathname.startsWith("/antibodies")) return "Antibodies";
    return null;
  });

  const [manualToggle, setManualToggle] = useState(false);
  const effectiveOpen = manualToggle ? openMenu : (() => {
    if (pathname.startsWith("/antibodies")) return "Antibodies";
    return openMenu;
  })();

  const toggleMenu = (label: string) => {
    setManualToggle(true);
    setOpenMenu(openMenu === label ? null : label);
  };

  const isActive = (href: string) => {
    const url = new URL(href, "http://localhost");
    const hrefPath = url.pathname;
    return pathname === hrefPath || pathname.startsWith(hrefPath + "/");
  };
  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some((c) => isActive(c.href)) ?? false;
  };

  const navContent = (
    <>
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="h-9 w-9 rounded-md bg-brand-green flex items-center justify-center flex-shrink-0">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">Antibody</h1>
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-gold">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const open = effectiveOpen === item.label;
          const parentActive = isParentActive(item);

          if (!hasChildren) {
            const active = item.href ? isActive(item.href) : false;
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={onClose}
                className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg
                  className={`h-5 w-5 flex-shrink-0 ${active ? "text-brand-green" : "text-slate-400 group-hover:text-brand-green"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          }

          return (
            <div key={item.label} className="mb-1">
              <button
                onClick={() => toggleMenu(item.label)}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  parentActive && open
                    ? "bg-white/10 text-white"
                    : parentActive
                    ? "text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg
                  className={`h-5 w-5 flex-shrink-0 ${parentActive ? "text-brand-green" : "text-slate-400 group-hover:text-brand-green"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="flex-1 text-left">{item.label}</span>
                <svg
                  className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Dropdown */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 border-l-2 border-white/10 pl-3 py-1">
                  {item.children!.map((child) => {
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          childActive
                            ? "bg-brand-green/15 text-brand-green font-medium"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-[11px] text-slate-500">Antibody Catalog v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-brand-navy">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-navy transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
