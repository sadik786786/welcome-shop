import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/server";
import GetProductButton from "@/components/product/GetProductButton";
import ProductGallery from "@/components/product/ProductGallery";
import { ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Product not found
          </h1>
          <p className="mt-2 text-slate-500">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Products
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate text-slate-700">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Image Gallery */}
          <ProductGallery images={images || []} productName={product.name} />

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-wide text-blue-600">
              {product.categories?.name || "Product"}
            </span>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-3xl font-bold text-slate-900">
                ₹{Number(product.price).toFixed(2)}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                In Stock
              </span>
            </div>

            {product.description && (
              <p className="mt-6 leading-7 text-slate-600">
                {product.description}
              </p>
            )}

            {/* Add to Cart Button */}
            <div className="mt-8">
              <GetProductButton
                product={{
                  name: product.name,
                  id: product.id,
                  price: product.price,
                  slug: product.slug,
                }}
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Free Shipping</p>
                  <p className="text-xs text-slate-500">On orders over ₹499</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Easy Returns</p>
                  <p className="text-xs text-slate-500">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Secure Checkout</p>
                  <p className="text-xs text-slate-500">100% protected payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}