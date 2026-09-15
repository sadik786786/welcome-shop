import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/server";
import { Search, SlidersHorizontal, PackageOpen, ArrowRight } from "lucide-react";

export default async function ProductsPage({ searchParams }) {
  const supabase = await createClient();
  const params = await searchParams;
  const category = params?.category?.trim() || "";
  const search = params?.search?.trim() || "";
  const sort = params?.sort || "newest";

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categorySelection = category ? "categories!inner" : "categories";
  let query = supabase.from("products").select(`
    id, name, slug, price,
    ${categorySelection} (id, name, slug),
    product_images (id, image_url, created_at)
  `);

  if (category) query = query.eq("categories.slug", category);
  if (search) query = query.ilike("name", `%${search}%`);
  query = query.order(
    sort === "price-asc" ? "price" : sort === "price-desc" ? "price" : "created_at",
    { ascending: sort === "price-asc" }
  );

  const { data: products, error: productsError } = await query;
  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              All Products
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Browse our curated collection of quality items.
            </p>
          </div>
          {!productsError && (
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Showing {totalProducts} result{totalProducts !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Error Banners */}
        {categoriesError && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-amber-800">
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Could not load categories. Showing all products.</span>
          </div>
        )}
        {productsError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-4 text-xs text-rose-800">
            <p className="font-bold">Failed to load products.</p>
            <p className="mt-1">{productsError.message}</p>
          </div>
        )}

        {/* Clean Filter & Search Bar */}
        <section className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-sm">
          <form
            method="GET"
            className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_200px_auto] md:items-center"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search products by name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">All Categories</option>
              {(categories || []).map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
            >
              Apply Filter
            </button>
          </form>
        </section>

        {/* Product Grid – Clean & Responsive */}
        {!productsError && products?.length > 0 && (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const firstImage = product.product_images?.[0]?.image_url;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PackageOpen className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {product.categories?.name || "Product"}
                    </span>
                    <h2 className="line-clamp-2 text-sm font-medium text-slate-900 transition-colors group-hover:text-indigo-600">
                      {product.name}
                    </h2>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-base font-extrabold text-slate-950">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Empty State */}
        {!productsError && products?.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <PackageOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">No products found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              We couldn&apos;t find any items matching your active search or selected category filter.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Reset Filters
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}