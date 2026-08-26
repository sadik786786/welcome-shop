import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

const allowedStatuses = [
  "pending",
  "approved",
  "rejected",
  "completed",
];

export async function PATCH(request) {
  try {
    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "Order ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    // Update order status
    const {
      data: order,
      error: updateError,
    } = await supabase
      .from("purchase_requests")
      .update({
        status,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);

      return NextResponse.json(
        {
          error: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Admin order API error:", error);

    return NextResponse.json(
      {
        error: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const supabase = await createClient();

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    // First check that the order exists
    // and is actually completed.
    const { data: order, error: fetchError } = await supabase
      .from("purchase_requests")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // Only completed orders can be deleted
    if (order.status !== "completed" && order.status !== "rejected") {
      return NextResponse.json(
        {
          error: "Only completed or rejected orders can be deleted.",
        },
        { status: 400 }
      );
    }

    // Delete the order
    const { error: deleteError } = await supabase
      .from("purchase_requests")
      .delete()
      .eq("id", orderId);

    if (deleteError) {
      console.error("Delete order error:", deleteError);

      return NextResponse.json(
        {
          error: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE order error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while deleting the order.",
      },
      { status: 500 }
    );
  }
}