"use client";

import AdminLayout from "@/components/AdminLayout";

export default function DesignDemosPage() {
  return (
    <AdminLayout title="Design Demos">
      <div className="card">
        <h2>Figma & design draft previews</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Share interactive UI wireframes, prototype demos, logos, and layout draft configurations with client workspaces.
        </p>
      </div>
    </AdminLayout>
  );
}
