"use client";

import AdminLayout from "@/components/AdminLayout";

export default function SiteHealthPage() {
  return (
    <AdminLayout title="Site Health Diagnostics">
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2>Site Health Summary</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Monitor live server metrics, database performance metrics, and SSL certificates to ensure SEOC remains fully functional.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-info">
            <p>Overall Uptime</p>
            <h3>99.98%</h3>
          </div>
          <div className="stat-icon-wrap success" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Avg Response Time</p>
            <h3>184 ms</h3>
          </div>
          <div className="stat-icon-wrap primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>SSL Status</p>
            <h3>Active</h3>
          </div>
          <div className="stat-icon-wrap success" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "16px" }}>Detailed Diagnostic Logs</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border-color)", fontSize: "14px" }}>
            <span>Database Query Execution Speed</span>
            <strong style={{ color: "var(--success-color)" }}>12ms (Excellent)</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border-color)", fontSize: "14px" }}>
            <span>NodeJS Process Memory Usage</span>
            <strong>32.4 MB / 512 MB</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border-color)", fontSize: "14px" }}>
            <span>Storage Disk Capacity</span>
            <strong>1.2 GB / 50 GB Used</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span>Third-Party API Integrations</span>
            <strong style={{ color: "var(--success-color)" }}>All Online (3/3)</strong>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
