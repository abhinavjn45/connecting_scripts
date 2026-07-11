"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ProductsPage() {
  return (
    <AdminLayout title="Products Management">
      <div className="card">
        <h2>Products Management</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Manage digital goods, templates, scripts, and software assets displayed on your portal.
        </p>
      </div>
    </AdminLayout>
  );
}
