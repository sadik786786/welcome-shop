import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();

  const adminSession = cookieStore.get("admin_session");

  // No admin session
  if (!adminSession?.value) {
    redirect("/admin-login");
  }

  const supabase = await createClient();

  // Verify that the admin still exists
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, name, email")
    .eq("id", adminSession.value)
    .maybeSingle();

  // Invalid session
  if (error || !admin) {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <AdminSidebar admin={admin} />

      <div className="lg:pl-64">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">

          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin.name}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {admin.name?.charAt(0)?.toUpperCase()}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="p-5 sm:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}