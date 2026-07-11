"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ContactQueriesPage() {
  return (
    <AdminLayout title="Contact Queries">
      <div className="card">
        <h2>Contact Form Queries</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Read message queries, query details, sender information, and reply details submitted through the contact forms.
        </p>
      </div>
    </AdminLayout>
  );
}
