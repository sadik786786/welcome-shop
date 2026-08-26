"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Package,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {createClient} from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userMenuRef = useRef(null);
  const supabase = createClient();
  const router = useRouter();

  // ─── Effects ──────────────────────────────────────────
  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click outside user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // ─── Supabase Auth ────────────────────────────────────
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ─── Auth handlers ────────────────────────────────────
  const handleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Sign in error:", error);
      // Optionally show a toast/notification
    }
    setIsLoading(false);
    // The redirect will happen automatically, but we close menus
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
    setIsLoading(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.refresh(); // Refresh server components if needed
  };

  // ─── Derived state ────────────────────────────────────
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? 
                   user?.email?.split("@")[0] ?? 
                   "Account";
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Guest";
  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  // ─── Render ──────────────────────────────────────────
  if (isLoading) {
    // Optionally render a skeleton loader to avoid layout shift
    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
              <div className="h-6 w-32 animate-pulse rounded-lg bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10 md:hidden" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* ─── Background Orbs ─────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl animate-[float_14s_ease-in-out_infinite_reverse]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl animate-[float_10s_ease-in-out_infinite]" />
      </div>

      <header
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${isScrolled
            ? "border-b border-white/20 bg-black/40 shadow-2xl backdrop-blur-xl"
            : "border-b border-white/5 bg-black/20 backdrop-blur-md"
          }
        `}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* ─── Logo ────────────────────────────────── */}
            <Link
              href="/"
              className="flex flex-shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-primary shadow-sm backdrop-blur-sm">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <span className="font-serif text-xl font-semibold tracking-tight text-white/90 sm:text-2xl">
                Welcome<span className="text-primary">Shop</span>
              </span>
            </Link>

            {/* ─── Desktop Nav ────────────────────────── */}
            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Primary"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ─── Right Actions ──────────────────────── */}
            <div className="flex items-center gap-2">

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 p-1 pr-2 text-white shadow-lg backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/40 sm:pr-3"
                  aria-label="Account menu"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 text-primary">
                    {user ? (
                      userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={displayName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {displayName[0].toUpperCase()}
                        </span>
                      )
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </span>
                  <span className="hidden text-sm font-medium text-white/80 sm:inline-block">
                    {firstName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/20 bg-black/40 p-2 text-white shadow-2xl backdrop-blur-xl duration-150 animate-in fade-in zoom-in-95"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 backdrop-blur-sm">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/30 text-base font-semibold text-primary">
                        {user ? (
                          userAvatar ? (
                            <img
                              src={userAvatar}
                              alt={displayName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            displayName[0].toUpperCase()
                          )
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user ? displayName : "Hello, Guest"}
                        </p>
                        <p className="truncate text-xs text-white/60">
                          {user ? user.email : "Sign in to access your account"}
                        </p>
                      </div>
                    </div>


                    {/* Auth action */}
                    <div className="mt-2 border-t border-white/10 pt-2">
                      {user ? (
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={isLoading}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoading ? "Signing out..." : "Sign out"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSignIn}
                          disabled={isLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50"
                        >
                          {isLoading ? "Signing in..." : "Sign in with Google"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white md:hidden"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Overlay ────────────────────────────── */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ─── Mobile Drawer ──────────────────────────────── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-xs transform flex-col border-r border-white/20 bg-black/40 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out md:hidden
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/20 px-5">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/30 text-primary">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold text-white">
              Welcome<span className="text-primary">Shop</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-white/40" />
            </Link>
          ))}

          {user && (
            <>
              <div className="my-2 border-t border-white/10" />
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <User className="h-4 w-4 text-white/40" />
                My Profile
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Package className="h-4 w-4 text-white/40" />
                Orders
              </Link>
            </>
          )}
        </nav>

        {/* Auth footer */}
        <div className="border-t border-white/20 p-4 backdrop-blur-sm">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/30 text-sm font-semibold text-primary">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    displayName[0].toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-white/60">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-\\[float_12s_ease-in-out_infinite\\] {
          animation: float 12s ease-in-out infinite;
        }
        .animate-\\[float_14s_ease-in-out_infinite_reverse\\] {
          animation: float 14s ease-in-out infinite reverse;
        }
        .animate-\\[float_10s_ease-in-out_infinite\\] {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}