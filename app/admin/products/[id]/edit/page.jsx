"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category_id: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // ─── Load product & categories ────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [productRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/categories"),
        ]);

        const productData = await productRes.json();
        const catData = await catRes.json();

        if (!productRes.ok) throw new Error(productData.error || "Failed to fetch product");
        if (!catRes.ok) throw new Error(catData.error || "Failed to fetch categories");

        setForm({
          name: productData.name || "",
          slug: productData.slug || "",
          description: productData.description || "",
          price: productData.price ?? "",
          category_id: productData.category_id || "",
        });

        setExistingImages(
          (productData.product_images || []).map((img) => ({
            id: img.id,
            image_url: img.image_url,
          }))
        );

        setCategories(catData.categoriesData || catData || []);
      } catch (err) {
        console.error("Load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (productId) fetchData();
  }, [productId]);

  // ─── Handlers ──────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(e) {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));
    setError("");
    setSuccess("");
  }

  function removeExistingImage(imageId) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleNewImages(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a JPG, PNG or WebP image.`);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is larger than 5 MB.`);
        e.target.value = "";
        return;
      }
    }

    const images = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...images]);
    e.target.value = "";
  }

  function removeNewImage(index) {
    setNewImages((prev) => {
      const img = prev[index];
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  // ─── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.category_id) return setError("Please select a category.");
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setError("Please enter a valid price.");
    if (existingImages.length === 0 && newImages.length === 0)
      return setError("Product must have at least one image.");

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(Number(form.price)));
      formData.append("category_id", form.category_id);
      formData.append(
        "existingImages",
        JSON.stringify(existingImages.map((img) => img.image_url))
      );
      newImages.forEach((img) => formData.append("images", img.file));

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");

      setSuccess("Product updated successfully! Redirecting…");
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  function dismissSuccess() {
    setSuccess("");
  }

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90">
        <div className="rounded-2xl border border-white/30 bg-white/30 px-8 py-6 backdrop-blur-xl shadow-2xl">
          <p className="text-slate-600">Loading product…</p>
        </div>
      </div>
    );
  }

  // ─── UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Edit Product</h1>
          <p className="mt-1 text-sm text-slate-500/90">Update your product information and images</p>
        </div>

        {/* Error */}
        {error && (
          <div className="relative rounded-2xl border border-red-200/40 bg-red-100/30 px-4 py-3 pr-10 text-sm text-red-700 backdrop-blur-sm">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="relative rounded-2xl border border-green-200/40 bg-green-100/30 px-4 py-3 pr-10 text-sm text-green-800 backdrop-blur-sm">
            {success}
            <button
              type="button"
              onClick={dismissSuccess}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* ─── Product Information ─── */}
          <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
            <h2 className="text-lg font-semibold text-slate-800">Product Information</h2>
            <div className="mt-5 space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
                  disabled={saving}
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="product-slug"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/30"
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-slate-500/80">Automatically generated from the product name.</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
                  disabled={saving}
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 pl-8 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
                  disabled={saving}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Existing Images ─── */}
          <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
            <h2 className="text-lg font-semibold text-slate-800">Existing Images</h2>
            <p className="mt-1 text-sm text-slate-500/90">Remove images you no longer want.</p>

            {existingImages.length === 0 ? (
              <div className="mt-5 rounded-xl border border-white/20 bg-white/10 px-6 py-8 text-center text-sm text-slate-500 backdrop-blur-sm">
                No existing images.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/20 backdrop-blur-sm"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.image_url}
                        alt={form.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      disabled={saving}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-500 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Add New Images ─── */}
          <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
            <h2 className="text-lg font-semibold text-slate-800">Add New Images</h2>
            <p className="mt-1 text-sm text-slate-500/90">Select one or more new images.</p>

            <div className="mt-5">
              <label
                htmlFor="new-images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/10 px-6 py-10 backdrop-blur-sm transition hover:border-blue-400 hover:bg-white/20"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm">
                    📷
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">Click to add images</p>
                  <p className="mt-1 text-xs text-slate-500/80">You can select multiple images</p>
                  <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP • Maximum 5 MB each</p>
                </div>
                <input
                  id="new-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleNewImages}
                  className="hidden"
                  disabled={saving}
                />
              </label>

              {/* New image previews */}
              {newImages.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-slate-700">New Images ({newImages.length})</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {newImages.map((image, index) => (
                      <div
                        key={`${image.file.name}-${index}`}
                        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/20 backdrop-blur-sm"
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={image.preview}
                            alt={`New image ${index + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          disabled={saving}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-500 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
                        >
                          ×
                        </button>
                        <div className="border-t border-white/20 bg-white/10 px-2 py-2">
                          <p className="truncate text-xs text-slate-600">{image.file.name}</p>
                          <p className="text-xs text-slate-400">{(image.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Buttons ─── */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={saving}
              className="rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating Product…" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}