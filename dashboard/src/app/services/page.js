"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ServicesPage() {
  return (
    <AdminLayout title="Services Management">
      <div className="card">
        <h2>Services Management</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Configure, add, edit, or remove Connecting Scripts agency marketing and optimization services displayed on the front-end.
        </p>
      </div>
    </AdminLayout>
  );
}
