"use client";

import AdminLayout from "@/components/AdminLayout";

export default function InvoicesPage() {
  return (
    <AdminLayout title="Invoices">
      <div className="card">
        <h2>Invoicing & billing panel</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Generate professional invoice worksheets, monitor payments, dues, tax calculations, and process payment links.
        </p>
      </div>
    </AdminLayout>
  );
}
