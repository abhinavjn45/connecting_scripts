"use client";

import AdminLayout from "@/components/AdminLayout";

export default function SeoSettingsPage() {
  return (
    <AdminLayout title="SEO Settings">
      <div className="card">
        <h2>SEO Settings</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Configure global metadata, search engine indexes, favicon, logos, robots.txt, and sitemap generation paths.
        </p>
      </div>
    </AdminLayout>
  );
}
