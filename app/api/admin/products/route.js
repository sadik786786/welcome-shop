import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export async function GET() {
  try {
    const supabase = createAdminClient();

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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get products error:", error);

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
      productsData: data || [],
    });
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}
// ==========================================
// CREATE PRODUCT
// ==========================================
export async function POST(request) {
  let productId = null;
  let uploadedFilePaths = [];

  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const categoryId = formData.get("category_id");
    const price = formData.get("price");

    // Get ALL images
    const images = formData
      .getAll("images")
      .filter(
        (file) =>
          file &&
          typeof file === "object" &&
          file.name &&
          file.size > 0
      );

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name || !categoryId || price === null) {
      return NextResponse.json(
        {
          error: "Name, category and price are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid price",
        },
        {
          status: 400,
        }
      );
    }

    // At least one image
    if (images.length === 0) {
      return NextResponse.json(
        {
          error: "At least one product image is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VALIDATE ALL IMAGES
    // ==========================================

    const MAX_SIZE = 5 * 1024 * 1024;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const image of images) {
      // Check type
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            error: `Invalid image type for "${image.name}". Only JPG, PNG and WebP are allowed.`,
          },
          {
            status: 400,
          }
        );
      }

      // Check size
      if (image.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: `"${image.name}" is larger than 5MB.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // ==========================================
    // SUPABASE ADMIN CLIENT
    // ==========================================

    const supabase = createAdminClient();

    // ==========================================
    // CHECK CATEGORY
    // ==========================================

    const {
      data: category,
      error: categoryError,
    } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        {
          error: "Selected category does not exist",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CREATE SLUG
    // ==========================================

    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if slug already exists
    const { data: existingProduct } =
      await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        slug,
        description:
          description?.trim() || null,
        price: Number(price),
        category_id: categoryId,
      })
      .select()
      .single();

    if (productError) {
      console.error(
        "Create product error:",
        productError
      );

      return NextResponse.json(
        {
          error: productError.message,
        },
        {
          status: 500,
        }
      );
    }

    productId = product.id;

    // ==========================================
    // UPLOAD ALL IMAGES
    // ==========================================

    const productImages = [];

    for (const image of images) {
      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `${productId}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(
            filePath,
            image,
            {
              contentType: image.type,
              upsert: false,
            }
          );

      if (uploadError) {
        console.error(
          "Storage upload error:",
          uploadError
        );

        throw new Error(
          `Failed to upload "${image.name}": ${uploadError.message}`
        );
      }

      // Keep track for cleanup
      uploadedFilePaths.push(filePath);

      // ==========================================
      // GET PUBLIC URL
      // ==========================================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData.publicUrl;

      productImages.push({
        product_id: productId,
        image_url: imageUrl,
      });
    }

    // ==========================================
    // INSERT ALL IMAGES INTO DATABASE
    // ==========================================

    const {
      data: insertedImages,
      error: imageError,
    } = await supabase
      .from("product_images")
      .insert(productImages)
      .select();

    if (imageError) {
      console.error(
        "Product images database error:",
        imageError
      );

      throw new Error(imageError.message);
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
        images: insertedImages,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Products POST error:",
      error
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    try {
      const supabase = createAdminClient();

      // Delete uploaded images
      if (uploadedFilePaths.length > 0) {
        await supabase.storage
          .from("product-images")
          .remove(uploadedFilePaths);
      }

      // Delete product
      // product_images will also be deleted
      // because of ON DELETE CASCADE
      if (productId) {
        await supabase
          .from("products")
          .delete()
          .eq("id", productId);
      }
    } catch (cleanupError) {
      console.error(
        "Cleanup error:",
        cleanupError
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}