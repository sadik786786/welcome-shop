import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed`
    );
  }

  const supabase = await createClient();

  // ==========================================
  // EXCHANGE GOOGLE CODE FOR SESSION
  // ==========================================

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth exchange error:", exchangeError);

    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed`
    );
  }

  // ==========================================
  // GET AUTHENTICATED USER
  // ==========================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Get user error:", userError);

    return NextResponse.redirect(
      `${origin}/login?error=user_not_found`
    );
  }

  // ==========================================
  // GOOGLE USER DATA
  // ==========================================

  const metadata = user.user_metadata || {};

  const googleIdentity = user.identities?.find(
    (identity) => identity.provider === "google"
  );

  const googleId =
    metadata.sub ||
    googleIdentity?.identity_data?.sub ||
    null;

  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "User";

  const image =
    metadata.avatar_url ||
    metadata.picture ||
    null;

  const email = user.email;

  // ==========================================
  // SAVE USER IN DATABASE
  // ==========================================

  const { error: userDbError } = await supabase
    .from("users")
    .upsert(
      {
        google_id: googleId,
        name: name,
        email: email,
        image: image,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      }
    );

  if (userDbError) {
    console.error("Users table error:", userDbError);

    return NextResponse.redirect(
      `${origin}/login?error=profile_failed`
    );
  }

  // ==========================================
  // SUCCESS
  // ==========================================

  return NextResponse.redirect(origin);
}