import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import GetProductButton from "@/components/product/GetProductButton";
import ProductGallery from "@/components/product/ProductGallery";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, CheckCircle2 } from "lucide-react";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product with category name
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      category_id,
      created_at,
      updated_at,
      categories (
        name
      )
    `)
    .eq("slug", slug)
    .single();

  if (productError) {
    console.error("Product fetch error:", productError);
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 mb-4">
            <span className="text-xl font-bold">404</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Product not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The product you are looking for may have been removed or is temporarily unavailable.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    );
  }

  // Fetch product images
  const { data: images, error: imageError } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", product.id)
    .order("created_at", { ascending: true });

  if (imageError) {
    console.error("Product images fetch error:", imageError);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Clean Minimal Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link href="/" className="transition hover:text-slate-900">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href="/products" className="transition hover:text-slate-900">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="truncate font-medium text-slate-900">{product.name}</span>
        </nav>

        {/* Main Grid: Gallery left, Info right */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Left: Sticky Image Gallery (Span 7) */}
          <div className="lg:col-span-7 lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-3xl bg-slate-50/65 border border-slate-100 p-3 sm:p-4">
              <ProductGallery images={images || []} productName={product.name} />
            </div>
          </div>

          {/* Right: Details & Buying Box (Span 5) */}
          <div className="flex flex-col lg:col-span-5">
            
            {/* Category & Status */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.categories?.name || "General"}
              </span>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                In Stock & Ready
              </div>
            </div>

            {/* Product Title */}
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            {/* Price Component */}
            <div className="mt-5 flex items-baseline gap-3 border-b border-slate-100 pb-6">
              <span className="text-4xl font-extrabold tracking-tight text-slate-950">
                ₹{Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">MRP (Incl. of all taxes)</span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="py-6 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the item</h3>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action / Buy Button Container */}
            <div className="pt-6">
              <GetProductButton
                product={{
                  name: product.name,
                  id: product.id,
                  price: product.price,
                  slug: product.slug,
                }}
              />
            </div>

            {/* Genuine Trust & Service Badges */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 transition hover:bg-slate-100/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Complimentary Shipping</p>
                  <p className="text-[11px] text-slate-500">Free delivery on orders over ₹499</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 transition hover:bg-slate-100/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Hassle-free Returns</p>
                  <p className="text-[11px] text-slate-500">30-day effortless return policy</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 transition hover:bg-slate-100/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Secure Payments</p>
                  <p className="text-[11px] text-slate-500">Encrypted checkout process</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}