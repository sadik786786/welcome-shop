import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch categories error:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      categoriesData: data || [],
    });
  } catch (error) {
    console.error("Categories GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}
export async function POST(request) {
  try {
    const cookieStore = await cookies();

    const adminSession = cookieStore.get("admin_session");

    if (!adminSession?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", adminSession.value)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const slug = body.slug?.trim().toLowerCase();

    if (!name || !slug) {
      return NextResponse.json(
        {
          error: "Category name and slug are required.",
        },
        { status: 400 }
      );
    }

    // Check duplicate slug
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        {
          error: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Create category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
      })
      .select()
      .single();

    if (error) {
      console.error("Create category error:", error);

      return NextResponse.json(
        {
          error: "Failed to create category.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}