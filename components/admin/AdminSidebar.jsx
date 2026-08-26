"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar({ admin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "🏠" },
    { name: "Products", href: "/admin/products", icon: "📦" },
    { name: "Categories", href: "/admin/categories", icon: "🗂️" },
    { name: "Orders", href: "/admin/orders", icon: "📋" },
  ];

  const isActive = (href) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/admin-login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Custom animations for floating and glowing */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.7), 0 8px 32px rgba(0,0,0,0.2); }
        }
      `}</style>

      {/* ===== Floating Toggle Button (mobile only) ===== */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle admin menu"
        className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/30 text-2xl text-slate-700 backdrop-blur-xl transition hover:bg-white/50 lg:hidden"
        style={{
          animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite',
          willChange: 'transform, box-shadow',
        }}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* ===== Mobile overlay ===== */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed bottom-0 left-0 z-50
          w-64
          border-r border-white/20
          bg-white/20
          backdrop-blur-2xl
          shadow-2xl
          transition-transform duration-300 ease-in-out
          top-0 lg:top-16
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/30 pointer-events-none" />

        <div className="relative flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-white/20 px-5">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-bold tracking-tight text-slate-800"
            >
              Welcome <span className="text-blue-600">Shop</span>
            </Link>
          </div>

          {/* Admin info – glass card */}
          <div className="border-b border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm transition hover:bg-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white shadow-md">
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {admin?.name || "Admin"}
                </p>
                <p className="truncate text-xs text-slate-500/80">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500/70">
              Main Menu
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                      ${
                        active
                          ? "bg-white/30 text-blue-600 shadow-lg backdrop-blur-sm"
                          : "text-slate-600 hover:bg-white/20 hover:text-slate-800"
                      }
                    `}
                  >
                    {/* Active indicator – glassy left border */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-500/80 shadow-blue-500/50" />
                    )}
                    <span className="flex w-5 justify-center text-base transition-transform group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom actions – glass buttons */}
          <div className="space-y-1 border-t border-white/20 p-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/20 hover:text-slate-800"
            >
              <span className="flex w-5 justify-center text-base">🌐</span>
              <span>View Website</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex w-5 justify-center text-base">🚪</span>
              <span>{loggingOut ? "Logging out…" : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}