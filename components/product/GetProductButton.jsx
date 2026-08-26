"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingCart,
  User,
  Package,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function GetProductButton({ product }) {
  const [open, setOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Reset error when modal opens/closes
  const clearError = () => setError("");

  const handleOpen = async () => {
    clearError();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoginPromptOpen(true);
        return;
      }

      setOpen(true);
    } catch (error) {
      console.error("Auth check error:", error);
      setLoginPromptOpen(true);
    }
  };

  const handleWhatsApp = async () => {
    clearError();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoginPromptOpen(true);
        setOpen(false);
        return;
      }

      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create purchase request."
        );
      }

      const adminWhatsAppNumber = "916353811919";

      const message = `
Hello, I want to buy this product.

Product: ${product.name}
Price: ₹${product.price}
Quantity: ${quantity}
Total: ₹${Number(product.price) * quantity}

Customer Name: ${name}

Please provide me with the details.
      `.trim();

      const whatsappUrl =
        `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
          message
        )}`;

      window.open(whatsappUrl, "_blank");

      setOpen(false);
      setName("");
      setQuantity(1);
    } catch (error) {
      console.error("Purchase request error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    setLoginPromptOpen(false);
    router.push("/"); // Redirect to home page where login is available
  };

  return (
    <>
      {/* Get Product Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
      >
        <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
        Get Product
      </button>

      {/* Login Prompt Modal */}
      {loginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <button
                type="button"
                onClick={() => setLoginPromptOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Login Required
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please login to your account to get this product.
            </p>
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Product Request Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Get Product
              </h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  clearError();
                }}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="mt-5">
              <label
                htmlFor="customer-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Quantity Input */}
            <div className="mt-4">
              <label
                htmlFor="quantity"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  clearError();
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Request...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Continue to WhatsApp
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                clearError();
              }}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}