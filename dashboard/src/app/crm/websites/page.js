"use client";

import AdminLayout from "@/components/AdminLayout";

export default function WebsitesPage() {
  return (
    <AdminLayout title="Client Websites">
      <div className="card">
        <h2>Client Websites Directory</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Monitor client URL domains, live status, hosting specs, ssl certificates, and analytic connections.
        </p>
      </div>
    </AdminLayout>
  );
}
