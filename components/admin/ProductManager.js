"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ----- Toast component (auto‑dismiss) -----
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = message.type === "success" ? "bg-emerald-500/90" : "bg-rose-500/90";
  return (
    <div
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl ${bgColor} px-6 py-3 text-white shadow-2xl backdrop-blur-sm transition-all`}
    >
      {message.text}
      <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">
        ✕
      </button>
    </div>
  );
}

// ----- Confirmation Modal -----
function ConfirmModal({ isOpen, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-slate-800">Delete Product</h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/40"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-rose-700"
            disabled={isLoading}
          >
            {isLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Main Component -----
export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Custom toast state
  const [toast, setToast] = useState(null);
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
  });

  async function fetchData() {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      if (!productsResponse.ok) {
        const error = await productsResponse.json();
        throw new Error(error.error || "Failed to fetch products");
      }
      if (!categoriesResponse.ok) {
        const error = await categoriesResponse.json();
        throw new Error(error.error || "Failed to fetch categories");
      }

      const { productsData } = await productsResponse.json();
      const { categoriesData } = await categoriesResponse.json();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Fetch products error:", error);
      setToast({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Actual deletion after confirmation
  async function handleDeleteConfirmed() {
    const id = confirmModal.productId;
    if (!id) return;

    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");

      setProducts((current) => current.filter((product) => product.id !== id));
      setToast({ type: "success", text: "Product deleted successfully." });
      setConfirmModal({ isOpen: false, productId: null });
    } catch (error) {
      console.error("Delete product error:", error);
      setToast({ type: "error", text: error.message });
    } finally {
      setDeleteLoading(null);
    }
  }

  // Open confirmation modal
  function handleDeleteClick(id) {
    setConfirmModal({ isOpen: true, productId: id });
  }

  // Cancel deletion
  function handleCancelDelete() {
    setConfirmModal({ isOpen: false, productId: null });
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90 p-4 md:p-6">
      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleCancelDelete}
        isLoading={deleteLoading === confirmModal.productId}
      />

      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        {/* ===== Header ===== */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Products</h1>
            <p className="mt-1 text-sm text-slate-500/90">Manage your store products</p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            + Add Product
          </Link>
        </div>

        {/* ===== Filters ===== */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl sm:flex-row md:p-5">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Table ===== */}
        <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl shadow-2xl">
          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-500">No products found.</p>
              <Link
                href="/admin/products/new"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 transition hover:underline"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="border-b border-white/20 bg-white/10 text-xs uppercase tracking-wider text-slate-500/90">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Product</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Category</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Price</th>
                    <th className="px-4 py-3 text-right font-semibold md:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredProducts.map((product) => {
                    const firstImage = product.product_images?.[0]?.image_url;
                    return (
                      <tr key={product.id} className="transition hover:bg-white/20">
                        {/* Product */}
                        <td className="px-4 py-3 md:px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/20 backdrop-blur-sm md:h-12 md:w-12">
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{product.name}</p>
                              <p className="text-xs text-slate-500/80">/{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-3 text-sm text-slate-600 md:px-6">
                          {product.categories?.name || "Unknown"}
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 md:px-6">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right md:px-6">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-lg border border-white/20 bg-white/20 px-3 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white/40"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              disabled={deleteLoading === product.id}
                              className="rounded-lg border border-red-200/40 bg-red-100/20 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm transition hover:bg-red-200/40 disabled:opacity-50"
                            >
                              {deleteLoading === product.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}