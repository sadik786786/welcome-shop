"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryManager({ categories = [] }) {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // SEARCH
  // =========================

  const filteredCategories = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(searchValue) ||
        category.slug.toLowerCase().includes(searchValue)
      );
    });
  }, [categories, search]);

  // =========================
  // OPEN ADD MODAL
  // =========================

  function openAddModal() {
    setModal("add");
    setSelectedCategory(null);

    setName("");
    setSlug("");
    setError("");
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================

  function openEditModal(category) {
    setModal("edit");
    setSelectedCategory(category);

    setName(category.name);
    setSlug(category.slug);

    setError("");
  }

  // =========================
  // CLOSE MODAL
  // =========================

  function closeModal() {
    if (loading) return;

    setModal(null);
    setSelectedCategory(null);

    setName("");
    setSlug("");

    setError("");
  }

  // =========================
  // NAME CHANGE
  // =========================

  function handleNameChange(value) {
    setName(value);

    // Automatically create slug while adding
    if (modal === "add") {
      setSlug(createSlug(value));
    }
  }

  // =========================
  // ADD CATEGORY
  // =========================

  async function handleAddCategory(event) {
    event.preventDefault();

    setError("");

    const categoryName = name.trim();
    const categorySlug = slug.trim().toLowerCase();

    if (!categoryName) {
      setError("Category name is required.");
      return;
    }

    if (!categorySlug) {
      setError("Category slug is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: categoryName,
          slug: categorySlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create category.");
        return;
      }

      closeModal();

      router.refresh();
    } catch (error) {
      console.error("Add category error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // UPDATE CATEGORY
  // =========================

  async function handleUpdateCategory(event) {
    event.preventDefault();

    setError("");

    const categoryName = name.trim();
    const categorySlug = slug.trim().toLowerCase();

    if (!categoryName) {
      setError("Category name is required.");
      return;
    }

    if (!categorySlug) {
      setError("Category slug is required.");
      return;
    }

    if (!selectedCategory) {
      setError("No category selected.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/categories/${selectedCategory.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update category.");
        return;
      }

      closeModal();

      router.refresh();
    } catch (error) {
      console.error("Update category error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DELETE CATEGORY
  // =========================

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(
          data.error || "Unable to delete category."
        );

        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Delete category error:", error);

      window.alert(
        "Something went wrong while deleting the category."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            WelcomeShop
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the categories used for your products.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <span className="mr-2 text-lg">
            +
          </span>

          Add Category
        </button>

      </div>

      {/* ================= CATEGORY CARD ================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="border-b border-slate-200 p-5">

          <div className="relative max-w-md">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* ================= DESKTOP TABLE ================= */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full text-left">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  #
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Slug
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Products
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCategories.length > 0 ? (

                filteredCategories.map((category, index) => (

                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Number */}

                    <td className="px-6 py-5 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    {/* Category */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                          🗂️
                        </div>

                        <span className="font-semibold text-slate-800">
                          {category.name}
                        </span>

                      </div>

                    </td>

                    {/* Slug */}

                    <td className="px-6 py-5">

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                        {category.slug}
                      </span>

                    </td>

                    {/* Product Count */}

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {category.productCount || 0}
                      </span>

                    </td>

                    {/* Actions */}

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(category)
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCategory(category)
                          }
                          disabled={loading}
                          className="rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center"
                  >

                    <div className="text-5xl">
                      🗂️
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-800">
                      No categories found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Try another search or create a new category.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ================= MOBILE CARDS ================= */}

        <div className="divide-y divide-slate-100 md:hidden">

          {filteredCategories.length > 0 ? (

            filteredCategories.map((category) => (

              <div
                key={category.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                      🗂️
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate font-semibold text-slate-800">
                        {category.name}
                      </h3>

                      <p className="mt-1 truncate font-mono text-xs text-slate-400">
                        {category.slug}
                      </p>

                    </div>

                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {category.productCount || 0}
                  </span>

                </div>

                <div className="mt-4 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(category)
                    }
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteCategory(category)
                    }
                    disabled={loading}
                    className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="px-6 py-16 text-center">

              <div className="text-5xl">
                🗂️
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No categories found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another search.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* ================= MODAL ================= */}

      {modal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  {modal === "add"
                    ? "Add Category"
                    : "Edit Category"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {modal === "add"
                    ? "Create a new product category."
                    : "Update this category."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                modal === "add"
                  ? handleAddCategory
                  : handleUpdateCategory
              }
              className="p-6"
            >

              {/* Error */}

              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>

              )}

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Mobile Accessories"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* SLUG */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(createSlug(event.target.value))
                  }
                  placeholder="mobile-accessories"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Example: mobile-accessories
                </p>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : modal === "add"
                    ? "Add Category"
                    : "Update Category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}