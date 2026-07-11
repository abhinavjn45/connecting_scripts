"use client";

import AdminLayout from "@/components/AdminLayout";

export default function RedirectsPage() {
  return (
    <AdminLayout title="SEO Redirects">
      <div className="card">
        <h2>URL Redirects Management</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Manage 301, 302, and 404 URL rewrites and routing mappings to maintain ranking juices.
        </p>
      </div>
    </AdminLayout>
  );
}
