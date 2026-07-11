"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ExtractorPage() {
  return (
    <AdminLayout title="Leads Extractor">
      <div className="card">
        <h2>Leads Extractor Tool</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Automated scraper helper tool to scan web pages, compile business phone/email directories, and exports contact lists.
        </p>
      </div>
    </AdminLayout>
  );
}
