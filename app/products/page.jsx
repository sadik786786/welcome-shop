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
  query = query.order(sort === "price-asc" ? "price" : sort === "price-desc" ? "price" : "created_at", { ascending: sort === "price-asc" });

  const { data: products, error: productsError } = await query;
  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1><p className="mt-1 text-sm text-slate-500">Browse our collection of quality items.</p></div>{!productsError && <p className="text-sm text-slate-500">{totalProducts} product{totalProducts !== 1 ? "s" : ""}</p>}</div>
        {categoriesError && <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><SlidersHorizontal className="h-4 w-4 shrink-0" /><span>Could not load categories. Showing all products.</span></div>}
        {productsError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"><p className="font-semibold">Failed to load products.</p><p className="mt-1">{productsError.message}</p></div>}
        <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"><form method="GET" className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" name="search" defaultValue={search} placeholder="Search products..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /></div><select name="category" defaultValue={category} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700"><option value="">All Categories</option>{(categories || []).map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><select name="sort" defaultValue={sort} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700"><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select><button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Search</button></form></section>
        {!productsError && products?.length > 0 && <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.map((product) => { const firstImage = product.product_images?.[0]?.image_url; return <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-square overflow-hidden bg-slate-100">{firstImage ? <Image src={firstImage} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" /> : <div className="flex h-full items-center justify-center"><PackageOpen className="h-12 w-12 text-slate-400" /></div>}</div><div className="flex flex-1 flex-col p-4"><span className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600">{product.categories?.name || "Product"}</span><h2 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-blue-600 sm:text-base">{product.name}</h2><div className="mt-auto flex items-center justify-between pt-3"><span className="text-lg font-bold text-slate-900">₹{Number(product.price).toFixed(2)}</span><ArrowRight className="h-4 w-4 text-slate-500" /></div></div></Link>; })}</section>}
        {!productsError && products?.length === 0 && <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><PackageOpen className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">No products found</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">We couldn&apos;t find any products matching your search or selected category.</p><Link href="/products" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">View All Products</Link></section>}
      </main>
    </div>
  );
}
