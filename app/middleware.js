import { NextResponse } from "next/server";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // ==========================================
  // ADMIN LOGIN PAGE
  // ==========================================

  if (pathname === "/admin-login") {
    const adminSession = request.cookies.get("admin_session");

    // Already logged in → go to admin dashboard
    if (adminSession) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    return NextResponse.next();
  }

  // ==========================================
  // PROTECT ADMIN PAGES
  // ==========================================

  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession) {
      return NextResponse.redirect(
        new URL("/admin-login", request.url)
      );
    }

    return NextResponse.next();
  }

  // ==========================================
  // PUBLIC PAGES
  // ==========================================

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin-login",
  ],
};