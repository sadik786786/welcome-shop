"use client";

import { createClient } from "@/app/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignOutButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Admin sign out error:", error);
        alert(error.message);
        setLoading(false);
        return;
      }

      // Send admin to admin login
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Admin sign out error:", error);
      alert("Failed to sign out");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}