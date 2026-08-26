import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin logout successful.",
      },
      { status: 200 }
    );

    // Remove admin session cookie
    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      {
        error: "Admin logout failed.",
      },
      { status: 500 }
    );
  }
}