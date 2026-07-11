"use client";

import AdminLayout from "../components/AdminLayout";
import { useEffect, useState } from "react";

export default function Home() {
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    // Mock dynamic lead fetching
    setRecentLeads([
      { id: 1, name: "John Smith", email: "john.smith@gmail.com", phone: "123-456-7890", date: "12 May 2024", status: "New" },
      { id: 2, name: "Ana Ritchie", email: "ana.ritchie@hotmail.com", phone: "987-654-3210", date: "11 May 2024", status: "In Progress" },
      { id: 3, name: "Matthew K.", email: "matthew.k@yahoo.com", phone: "456-789-0123", date: "10 May 2024", status: "Completed" },
      { id: 4, name: "Sarah Connor", email: "sconnor@skynet.com", phone: "789-012-3456", date: "09 May 2024", status: "New" }
    ]);
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Leads</p>
            <h3>148</h3>
          </div>
          <div className="stat-icon-wrap primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Published Blogs</p>
            <h3>9</h3>
          </div>
          <div className="stat-icon-wrap success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Case Studies</p>
            <h3>7</h3>
          </div>
          <div className="stat-icon-wrap danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Site Health</p>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              98.6%
              <span className="health-pulse"></span>
            </h3>
          </div>
          <div className="stat-icon-wrap success" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Dashboard Widget Grid */}
      <div className="dashboard-grid">
        {/* Lead Activity Chart */}
        <div className="widget">
          <div className="widget-header">
            <h2 className="widget-title">Lead Activity (Monthly Trends)</h2>
            <span style={{ color: "var(--primary-color)", fontWeight: "600", fontSize: "14px" }}>+24% this month</span>
          </div>
          <div style={{ marginTop: "10px" }}>
            <svg viewBox="0 0 500 200" width="100%" height="200px">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="170" x2="480" y2="170" stroke="var(--border-color)" strokeWidth="1" />
              
              {/* Y-Axis labels */}
              <text x="15" y="25" fill="var(--text-muted)" fontSize="10">150</text>
              <text x="15" y="75" fill="var(--text-muted)" fontSize="10">100</text>
              <text x="15" y="125" fill="var(--text-muted)" fontSize="10">50</text>
              <text x="15" y="175" fill="var(--text-muted)" fontSize="10">0</text>
              
              {/* X-Axis labels */}
              <text x="50" y="195" fill="var(--text-muted)" fontSize="10">Jan</text>
              <text x="120" y="195" fill="var(--text-muted)" fontSize="10">Feb</text>
              <text x="190" y="195" fill="var(--text-muted)" fontSize="10">Mar</text>
              <text x="260" y="195" fill="var(--text-muted)" fontSize="10">Apr</text>
              <text x="330" y="195" fill="var(--text-muted)" fontSize="10">May</text>
              <text x="400" y="195" fill="var(--text-muted)" fontSize="10">Jun</text>
              <text x="470" y="195" fill="var(--text-muted)" fontSize="10">Jul</text>

              {/* Area under the line (Gradient) */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 50,170 L 50,110 L 120,130 L 190,80 L 260,120 L 330,40 L 400,60 L 470,25 L 470,170 Z" fill="url(#chartGradient)" />

              {/* Smooth path line */}
              <path d="M 50,110 L 120,130 L 190,80 L 260,120 L 330,40 L 400,60 L 470,25" fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Dots */}
              <circle cx="50" cy="110" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="120" cy="130" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="190" cy="80" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="260" cy="120" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="330" cy="40" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="400" cy="60" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
              <circle cx="470" cy="25" r="4" fill="var(--surface-color)" stroke="var(--primary-color)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="widget">
          <h2 className="widget-title" style={{ marginBottom: "20px" }}>Marketing Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                <span>Organic SEO Traffic</span>
                <strong>85%</strong>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "85%", height: "100%", backgroundColor: "var(--success-color)" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                <span>PPC Conversion Rate</span>
                <strong>64%</strong>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "64%", height: "100%", backgroundColor: "var(--primary-color)" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                <span>Social Media Growth</span>
                <strong>42%</strong>
              </div>
              <div style={{ height: "6px", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "42%", height: "100%", backgroundColor: "#a855f7" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Site Health Diagnostics Widget */}
        <div className="widget" style={{ marginTop: "24px" }}>
          <div className="widget-header">
            <h2 className="widget-title">Site Health Monitor</h2>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--success-color)", fontWeight: "600" }}>
              <span className="health-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>Server Uptime</span>
              <strong style={{ color: "var(--success-color)" }}>99.98%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>API Response Time</span>
              <strong>184 ms (Optimal)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <span style={{ color: "var(--text-muted)" }}>SSL Certificate</span>
              <strong style={{ color: "var(--success-color)" }}>Valid (280d left)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)" }}>Database Query Speed</span>
              <strong>12 ms (Optimal)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contact Inquiries */}
      <div className="widget" style={{ width: "100%" }}>
        <div className="widget-header">
          <h2 className="widget-title">Recent Contact Leads</h2>
          <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>View All</button>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.date}</td>
                  <td>
                    <span className={`badge ${lead.status === 'Completed' ? 'success' : lead.status === 'In Progress' ? 'primary' : 'danger'}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
