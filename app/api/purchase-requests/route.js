import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Get logged-in Supabase Auth user
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

    // 2. Get request data
    const body = await request.json();

    const { product_id, quantity } = body;

    if (!product_id || !quantity) {
      return NextResponse.json(
        {
          error: "Product and quantity are required.",
        },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        {
          error: "Quantity must be at least 1.",
        },
        { status: 400 }
      );
    }

    // 3. Find user in public.users
    const { data: dbUser, error: dbUserError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("email", user.email)
      .single();

    if (dbUserError || !dbUser) {
      console.error("Database user error:", dbUserError);

      return NextResponse.json(
        {
          error: "User profile not found.",
          details: dbUserError?.message,
        },
        { status: 404 }
      );
    }

    // 4. Create purchase request
    const { data: purchaseRequest, error: purchaseError } =
      await supabase
        .from("purchase_requests")
        .insert({
          user_id: dbUser.id,
          product_id: product_id,
          quantity: quantity,
          status: "pending",
        })
        .select()
        .single();

    if (purchaseError) {
      console.error("Purchase request insert error:", {
        code: purchaseError.code,
        message: purchaseError.message,
        details: purchaseError.details,
        hint: purchaseError.hint,
      });

      return NextResponse.json(
        {
          error: purchaseError.message,
          details: purchaseError.details,
          hint: purchaseError.hint,
          code: purchaseError.code,
        },
        { status: 500 }
      );
    }

    // 5. Success
    return NextResponse.json({
      success: true,
      purchaseRequest,
    });
  } catch (error) {
    console.error("Purchase request error:", error);

    return NextResponse.json(
      {
        error: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
}