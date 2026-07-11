"use client";

import AdminLayout from "@/components/AdminLayout";

export default function KeywordsPage() {
  return (
    <AdminLayout title="Keyword Tracker">
      <div className="card">
        <h2>Keyword Tracker</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Monitor search rankings, impressions, search queries, and optimize copy dynamically.
        </p>
      </div>
    </AdminLayout>
  );
}
