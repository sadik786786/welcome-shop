import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

// GET single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        category_id,
        name,
        slug,
        description,
        price,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        ),
        product_images (
          id,
          image_url,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get product error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const supabase = createAdminClient();

    // Read multipart/form-data
    const formData = await request.formData();

    const name = formData.get("name");
    const slug = formData.get("slug");
    const description = formData.get("description");
    const price = formData.get("price");
    const category_id = formData.get("category_id");

    // Existing image URLs that user kept
    const existingImagesRaw = formData.get("existingImages");

    let existingImages = [];

    if (existingImagesRaw) {
      try {
        existingImages = JSON.parse(existingImagesRaw);
      } catch {
        existingImages = [];
      }
    }

    // New uploaded files
    const imageFiles = formData.getAll("images");

    // ------------------------------------
    // 1. Update product
    // ------------------------------------

    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        name: name?.trim(),
        slug: slug?.trim(),
        description: description?.trim() || null,
        price: Number(price),
        category_id: category_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (productError) {
      console.error("Update product error:", productError);

      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      );
    }

    // ------------------------------------
    // 2. Upload new images
    // ------------------------------------

    const uploadedImageUrls = [];

    for (const file of imageFiles) {
      if (!(file instanceof File) || file.size === 0) {
        continue;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `${file.name} is not a JPG, PNG or WebP image.`,
          },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `${file.name} is larger than 5MB.`,
          },
          { status: 400 }
        );
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `${id}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);

        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicUrl);
    }

    // ------------------------------------
    // 3. Combine existing + new images
    // ------------------------------------

    const allImageUrls = [
      ...existingImages,
      ...uploadedImageUrls,
    ].filter(Boolean);

    // ------------------------------------
    // 4. Delete old product_images records
    // ------------------------------------

    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

    if (deleteImagesError) {
      console.error(
        "Delete product images error:",
        deleteImagesError
      );

      return NextResponse.json(
        { error: deleteImagesError.message },
        { status: 500 }
      );
    }

    // ------------------------------------
    // 5. Insert updated image records
    // ------------------------------------

    if (allImageUrls.length > 0) {
      const imageRows = allImageUrls.map((url) => ({
        product_id: id,
        image_url: url,
      }));

      const { error: insertImagesError } = await supabase
        .from("product_images")
        .insert(imageRows);

      if (insertImagesError) {
        console.error(
          "Insert product images error:",
          insertImagesError
        );

        return NextResponse.json(
          { error: insertImagesError.message },
          { status: 500 }
        );
      }
    }

    // ------------------------------------
    // 6. Return updated product
    // ------------------------------------

    const { data: updatedProduct, error: fetchError } =
      await supabase
        .from("products")
        .select(`
          id,
          category_id,
          name,
          slug,
          description,
          price,
          created_at,
          updated_at,
          categories (
            id,
            name,
            slug
          ),
          product_images (
            id,
            image_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete product error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}