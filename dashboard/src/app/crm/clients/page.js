"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ClientsPage() {
  return (
    <AdminLayout title="Clients Database">
      <div className="card">
        <h2>Client Relationship Database</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Manage contact details, business information, contracts, and active services for your agency clients.
        </p>
      </div>
    </AdminLayout>
  );
}
