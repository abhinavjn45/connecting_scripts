"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ReportsPage() {
  return (
    <AdminLayout title="Financial Reports">
      <div className="card">
        <h2>Profit, loss & tax reports</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Compile financial statements, download monthly summaries, balance sheets, and export transaction audit records.
        </p>
      </div>
    </AdminLayout>
  );
}
