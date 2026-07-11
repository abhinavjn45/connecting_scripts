"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ExpensesPage() {
  return (
    <AdminLayout title="Expenses">
      <div className="card">
        <h2>Expense tracker</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Log agency operational payouts, subscriptions, third-party software licenses, contractors, and hosting expenditures.
        </p>
      </div>
    </AdminLayout>
  );
}
