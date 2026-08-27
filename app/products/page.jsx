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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      {/* Decorative blurred blobs for depth */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-32 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Products
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Browse our curated collection of quality items.
            </p>
          </div>
          {!productsError && (
            <p className="text-sm font-medium text-slate-500">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Error messages */}
        {categoriesError && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 backdrop-blur-sm">
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>Could not load categories. Showing all products.</span>
          </div>
        )}
        {productsError && (
          <div className="mb-6 rounded-2xl border border-red-200/70 bg-red-50/80 px-4 py-4 text-sm text-red-800 backdrop-blur-sm">
            <p className="font-semibold">Failed to load products.</p>
            <p className="mt-1">{productsError.message}</p>
          </div>
        )}

        {/* Filter / Search bar – Glass panel */}
        <section className="mb-10 rounded-3xl border border-white/60 bg-white/40 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:p-5">
          <form
            method="GET"
            className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full rounded-xl border border-white/60 bg-white/60 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none backdrop-blur-sm transition focus:border-blue-400 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-700 outline-none backdrop-blur-sm transition focus:border-blue-400 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
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
              className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-700 outline-none backdrop-blur-sm transition focus:border-blue-400 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </section>

        {/* Product Grid – Glassmorphism cards */}
        {!productsError && products?.length > 0 && (
          <section className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const firstImage = product.product_images?.[0]?.image_url;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-xl hover:shadow-slate-300/50"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100/50">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                        priority
                        
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PackageOpen className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    {/* Subtle gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {product.categories?.name || "Product"}
                    </span>
                    <h2 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-600 sm:text-base">
                      {product.name}
                    </h2>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {!productsError && products?.length === 0 && (
          <section className="rounded-3xl border border-white/60 bg-white/40 px-6 py-16 text-center shadow-xl shadow-slate-200/50 backdrop-blur-md">
            <PackageOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">No products found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              We couldn&apos;t find any products matching your search or selected category.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}