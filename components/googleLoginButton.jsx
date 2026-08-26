"use client";

import { createClient } from "@/app/lib/supabase/client";
import { useState } from "react";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google login error:", error);
        alert(error.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected Google login error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        "Signing in..."
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.09A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29A7.22 7.22 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.61 4.58 1.81l3.43-3.43C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.88 8.87 4.77 12 4.77z"
            />
          </svg>

          Continue with Google
        </>
      )}
    </button>
  );
}