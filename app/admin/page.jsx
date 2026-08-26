import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get product count
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Get category count
  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  // Get recent products (with relation)
  const { data: recentProducts, error: recentProductsError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      created_at,
      categories ( name ),
      product_images ( id, image_url )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentProductsError) {
    console.error("Recent products fetch error:", recentProductsError);
  }

  // Helper: format date
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        {/* ===== Header ===== */}
        <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
          <p className="text-sm font-semibold text-blue-600">WelcomeShop</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500/90">
            Manage your store from one place.
          </p>
        </div>

        {/* ===== Stats Grid ===== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Products Card */}
          <div className="group relative rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl transition hover:bg-white/50 hover:shadow-3xl md:p-5">
            {/* Inner glow overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500/80 md:text-sm">
                  Total Products
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
                  {productCount ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-xl backdrop-blur-sm md:h-12 md:w-12 md:text-2xl">
                📦
              </div>
            </div>
            <Link
              href="/admin/products"
              className="relative mt-3 inline-block text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline md:text-sm"
            >
              Manage Products →
            </Link>
          </div>

          {/* Categories Card */}
          <div className="group relative rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl transition hover:bg-white/50 hover:shadow-3xl md:p-5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500/80 md:text-sm">
                  Categories
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
                  {categoryCount ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-xl backdrop-blur-sm md:h-12 md:w-12 md:text-2xl">
                🗂️
              </div>
            </div>
            <Link
              href="/admin/categories"
              className="relative mt-3 inline-block text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline md:text-sm"
            >
              Manage Categories →
            </Link>
          </div>

          {/* Quick Action Card – gradient glass with stronger shading */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-blue-500/40 to-indigo-500/40 p-4 backdrop-blur-xl shadow-2xl transition hover:shadow-3xl md:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <p className="text-xs font-medium text-blue-100 md:text-sm">
                Quick Action
              </p>
              <h2 className="mt-1 text-lg font-bold text-white md:text-xl">
                Add a new product
              </h2>
              <p className="mt-1 text-xs text-blue-100/90 md:text-sm">
                Add products to your WelcomeShop catalog.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-3 inline-flex rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-blue-600 shadow-lg backdrop-blur-sm transition hover:bg-white hover:shadow-xl md:mt-4"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Recent Products Table ===== */}
        <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/20 px-4 py-3 md:px-6 md:py-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 md:text-lg">
                Recent Products
              </h2>
              <p className="mt-0.5 text-xs text-slate-500/80">
                Recently added products
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline md:text-sm"
            >
              View All
            </Link>
          </div>

          {recentProducts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-white/10 text-[10px] uppercase tracking-wider text-slate-500/90 md:text-xs">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Product</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Category</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Price</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-white/20"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 md:px-6">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500/90 md:px-6 md:text-sm">
                        {product.categories?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 md:px-6">
                        ₹{Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500/90 md:px-6 md:text-sm">
                        {formatDate(product.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center md:py-16">
              <div className="text-4xl md:text-5xl">📦</div>
              <h3 className="mt-3 font-semibold text-slate-800 md:mt-4">
                No products yet
              </h3>
              <p className="mt-1 text-sm text-slate-500/90">
                Start by adding your first product.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
              >
                Add Product
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}