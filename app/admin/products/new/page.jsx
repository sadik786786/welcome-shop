"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category_id: "",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch categories");
      setCategories(data.categoriesData || data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      setError(error.message);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Form helpers
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
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
    setForm((current) => ({ ...current, name, slug: generateSlug(name) }));
    setError("");
    setSuccess("");
  }

  // Image handling
  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024; // ✅ changed from 40 to 5

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a JPG, PNG or WebP image.`);
        e.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is larger than 5 MB.`); // ✅ updated message
        e.target.value = "";
        return;
      }
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((current) => [...current, ...newImages]);
    e.target.value = "";
  }

  function removeImage(index) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function removeAllImages() {
    setImages([]);
  }

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (images.length === 0) {
      setError("Please select at least one product image.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(form.price));
      formData.append("category_id", form.category_id);
      images.forEach((img) => formData.append("images", img.file));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create product");

      // Success – show message and redirect after a short delay
      setSuccess("Product created successfully! Redirecting…");
      setLoading(false);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Create product error:", error);
      setError(error.message || "Failed to create product");
      setLoading(false);
    }
  }

  // Dismiss success message manually (optional)
  function dismissSuccess() {
    setSuccess("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Add Product</h1>
          <p className="mt-1 text-sm text-slate-500/90">Add a new product to your store</p>
        </div>

        {/* Error Box */}
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

        {/* Success Box */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Product Information */}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading || loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? "Loading categories…" : "Select category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
            <h2 className="text-lg font-semibold text-slate-800">Product Images</h2>
            <p className="mt-1 text-sm text-slate-500/90">Upload one or more images for this product.</p>

            <div className="mt-5">
              <label
                htmlFor="product-images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/10 px-6 py-10 backdrop-blur-sm transition hover:border-blue-400 hover:bg-white/20"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm">
                    📷
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">Click to upload images</p>
                  <p className="mt-1 text-xs text-slate-500/80">You can select multiple images</p>
                  <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP • Maximum 5 MB each</p> {/* ✅ updated text */}
                </div>
                <input
                  id="product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {images.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Selected Images ({images.length})</p>
                    <button
                      type="button"
                      onClick={removeAllImages}
                      disabled={loading}
                      className="text-sm text-red-500 transition hover:text-red-700 disabled:opacity-50"
                    >
                      Remove All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={`${image.file.name}-${index}`}
                        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/20 backdrop-blur-sm"
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={image.preview}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
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

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={loading}
              className="rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingCategories}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Product…" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}