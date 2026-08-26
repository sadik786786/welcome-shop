"use client";

import { useMemo, useState } from "react";

const statuses = ["all", "pending", "approved", "rejected", "completed"];

export default function OrdersManager({ initialOrders, initialError }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(initialError || "");
  const [success, setSuccess] = useState("");

  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    return orders.filter((order) => {
      const customerName = order.users?.name?.toLowerCase() || "";
      const customerEmail = order.users?.email?.toLowerCase() || "";
      const productName = order.products?.name?.toLowerCase() || "";
      const phone = order.phone?.toLowerCase() || "";
      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        productName.includes(searchValue) ||
        phone.includes(searchValue);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update order.");

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSuccess(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Update order error:", error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this completed order?")) return;

    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete order.");

      setOrders((current) => current.filter((order) => order.id !== orderId));
      setSuccess("Order deleted successfully!");
    } catch (error) {
      console.error("Delete order error:", error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100/80 text-yellow-800";
      case "approved":
        return "bg-blue-100/80 text-blue-800";
      case "rejected":
        return "bg-red-100/80 text-red-800";
      case "completed":
        return "bg-green-100/80 text-green-800";
      default:
        return "bg-gray-100/80 text-gray-800";
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const stats = [
    { label: "Total", value: orders.length, color: "text-slate-700" },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      color: "text-yellow-600",
    },
    {
      label: "Approved",
      value: orders.filter((o) => o.status === "approved").length,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "completed").length,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50/90 to-slate-200/90 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-500/90">Manage customer purchase requests.</p>
        </div>

        {/* Error Message */}
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

        {/* Success Message */}
        {success && (
          <div className="relative rounded-2xl border border-green-200/40 bg-green-100/30 px-4 py-3 pr-10 text-sm text-green-800 backdrop-blur-sm">
            {success}
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:p-5"
            >
              <p className="text-xs font-medium text-slate-500/80 md:text-sm">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold md:text-3xl ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/30 p-4 backdrop-blur-xl shadow-2xl md:flex-row md:p-5">
          <input
            type="search"
            placeholder="Search customer, email, phone or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40 md:flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/40"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl shadow-2xl">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-800">No orders found</h2>
              <p className="mt-2 text-sm text-slate-500/90">Try changing your search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/20 bg-white/10 text-xs uppercase tracking-wider text-slate-500/90">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Product</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Qty</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Total</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Status</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Date</th>
                    <th className="px-4 py-3 text-left font-semibold md:px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOrders.map((order) => {
                    const total = Number(order.products?.price || 0) * Number(order.quantity || 0);
                    return (
                      <tr key={order.id} className="transition hover:bg-white/20">
                        <td className="px-4 py-4 md:px-6">
                          <p className="font-semibold text-slate-800">{order.users?.name || "Unknown"}</p>
                          <p className="text-sm text-slate-500/80">{order.users?.email || "-"}</p>
                        </td>
                        <td className="px-4 py-4 md:px-6">
                          <p className="font-medium text-slate-700">{order.products?.name || "Deleted product"}</p>
                          <p className="text-sm text-slate-500/80">₹{order.products?.price || 0}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-700 md:px-6">{order.quantity}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800 md:px-6">₹{total.toFixed(2)}</td>
                        <td className="px-4 py-4 text-slate-600 md:px-6">{order.phone}</td>
                        <td className="px-4 py-4 md:px-6">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 md:px-6">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-4 md:px-6">
                          {updatingId === order.id ? (
                            <span className="text-sm text-slate-500">Updating…</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {order.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateStatus(order.id, "approved")}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => updateStatus(order.id, "rejected")}
                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === "approved" && (
                                <button
                                  onClick={() => updateStatus(order.id, "completed")}
                                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-green-700"
                                >
                                  Complete
                                </button>
                              )}
                              {order.status === "rejected" && (
                                <span className="text-sm text-slate-400">Rejected</span>
                              )}
                              {(order.status === "rejected" || order.status === "completed") && (
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-sm text-slate-500/80">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>
    </div>
  );
}