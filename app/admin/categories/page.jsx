import { createClient } from "@/app/lib/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("Categories fetch error:", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Failed to load categories
        </h2>

        <p className="mt-1 text-sm text-red-600">
          Please try again later.
        </p>
      </div>
    );
  }

  // Get product count for each category
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("category_id");

  if (productsError) {
    console.error("Products count error:", productsError);
  }

  const productCounts = {};

  products?.forEach((product) => {
    if (!product.category_id) return;

    productCounts[product.category_id] =
      (productCounts[product.category_id] || 0) + 1;
  });

  const categoriesWithCounts = (categories || []).map((category) => ({
    ...category,
    productCount: productCounts[category.id] || 0,
  }));

  return (
    <CategoryManager categories={categoriesWithCounts} />
  );
}