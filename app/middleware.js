import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  // Get custom admin session cookie
  const adminSession = request.cookies.get("admin_session");

  // ==========================================
  // ADMIN LOGIN PAGE
  // ==========================================

  // If admin is already logged in,
  // don't allow them to visit /admin-login
  if (pathname === "/admin-login") {
    if (adminSession) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    return response;
  }

  // ==========================================
  // PROTECT ADMIN PAGES
  // ==========================================

  if (pathname.startsWith("/admin")) {
    if (!adminSession) {
      return NextResponse.redirect(
        new URL("/admin-login", request.url)
      );
    }

    return response;
  }

  // ==========================================
  // SUPABASE USER AUTHENTICATION
  // ==========================================

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  // ==========================================
  // GET SUPABASE USER
  // ==========================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Your normal user authentication
  // can be handled here if needed.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};