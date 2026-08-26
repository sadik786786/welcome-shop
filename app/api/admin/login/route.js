import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password =  await body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // Find admin
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      console.error("Admin query error:", error);

      return NextResponse.json(
        {
          error: "Something went wrong.",
        },
        { status: 500 }
      );
    }

    // Don't reveal whether email exists
    if (!admin) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Verify password against the bcrypt hash stored in Supabase
    const passwordValid = await bcrypt.compare(
      password,
      admin.password_hash
    );


    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Create session cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });

    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}