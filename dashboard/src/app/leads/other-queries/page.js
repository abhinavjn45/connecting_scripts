"use client";

import AdminLayout from "@/components/AdminLayout";

export default function OtherQueriesPage() {
  return (
    <AdminLayout title="Other Queries">
      <div className="card">
        <h2>Uncategorized Lead Queries</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Manage newsletter sign-ups, widget feedback forms, custom pop-up inputs, and alternative agency requests.
        </p>
      </div>
    </AdminLayout>
  );
}
