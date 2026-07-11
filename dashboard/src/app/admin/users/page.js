"use client";

import AdminLayout from "@/components/AdminLayout";

export default function UserManagementPage() {
  return (
    <AdminLayout title="User Management">
      <div className="card">
        <h2>Administrator Users</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Manage agency dashboard administrator accounts, configure access privileges, and edit user profile roles.
        </p>
      </div>
    </AdminLayout>
  );
}
