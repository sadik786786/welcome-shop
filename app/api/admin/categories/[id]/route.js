import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

async function verifyAdmin() {
  const cookieStore = await cookies();

  const adminSession = cookieStore.get("admin_session");

  if (!adminSession?.value) {
    return null;
  }

  const supabase = await createClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", adminSession.value)
    .maybeSingle();

  return admin;
}

// UPDATE CATEGORY
export async function PUT(request, { params }) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

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

    const supabase = await createClient();

    // Check duplicate slug
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        {
          error: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Update category
    // NOTE: There is NO updated_at column in your table.
    const { data, error } = await supabase
      .from("categories")
      .update({
        name,
        slug,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update category error:", error);

      return NextResponse.json(
        {
          error: "Failed to update category.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: data,
    });
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

// DELETE CATEGORY
export async function DELETE(request, { params }) {
  try {
    const admin = await verifyAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const supabase = await createClient();

    // Check if products use this category
    const { count, error: countError } = await supabase
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("category_id", id);

    if (countError) {
      console.error(countError);

      return NextResponse.json(
        {
          error: "Unable to check products.",
        },
        { status: 500 }
      );
    }

    // Don't delete category if products exist
    if (count > 0) {
      return NextResponse.json(
        {
          error: `This category has ${count} product${
            count === 1 ? "" : "s"
          }. Remove or move those products before deleting the category.`,
        },
        { status: 409 }
      );
    }

    // Delete category
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete category error:", error);

      return NextResponse.json(
        {
          error: "Failed to delete category.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
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