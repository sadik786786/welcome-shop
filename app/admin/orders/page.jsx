import { createClient } from "@/app/lib/supabase/server";
import OrdersManager from "@/components/admin/OrdersManager";

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: orders,
    error,
  } = await supabase
    .from("purchase_requests")
    .select(`
      id,
      quantity,
      status,
      created_at,

      users (
        id,
        name,
        email
      ),

      products (
        id,
        name,
        price,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Orders fetch error:", error);
  }

  return (
    <main className="p-6">
      <OrdersManager
        initialOrders={orders || []}
        initialError={error?.message || null}
      />
    </main>
  );
}