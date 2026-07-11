"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tab Routing
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("details"); // "details" | "security" | "notifications" | "activity"

  useEffect(() => {
    if (tabParam && ["details", "security", "notifications", "activity"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Tab State Switcher (Updates URL query params without full page reload)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSuccessMsg("");
    router.replace(`/admin/profile?tab=${tabName}`);
  };

  // Profile Details State
  const [firstName, setFirstName] = useState("Administrator");
  const [lastName, setLastName] = useState("User");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [email, setEmail] = useState("admin@seocagency.com");
  const [bio, setBio] = useState("Lead Developer & Super Administrator for SEOC Agency operations dashboard.");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security & 2FA State
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [sessionList, setSessionList] = useState([
    { id: 1, device: "Windows Desktop", browser: "Chrome 124.0", ip: "192.168.1.45", current: true },
    { id: 2, device: "Apple iPhone 15 Pro", browser: "Safari Mobile", ip: "172.56.21.90", current: false },
    { id: 3, device: "macOS Macbook Air", browser: "Firefox 125.1", ip: "192.168.1.12", current: false }
  ]);

  // Notifications preferences State
  const [emailAlerts, setEmailAlerts] = useState({
    leads: true,
    backups: true,
    uptime: false
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const recentActivities = [
    { id: 1, action: "Updated SEO keywords metadata", target: "SEO Management", time: "10 mins ago" },
    { id: 2, action: "Extracted 42 fresh business leads", target: "Leads Extractor", time: "1 hour ago" },
    { id: 3, action: "Approved client invoice draft", target: "Invoices (#INV-8402)", time: "4 hours ago" },
    { id: 4, action: "Configured Site Health Widget status metrics", target: "Dashboard Health Monitor", time: "Yesterday" },
    { id: 5, action: "Generated new website portfolio preview", target: "CRM - Design Demos", time: "2 days ago" }
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg("");
    setTimeout(() => {
      setSavingProfile(false);
      setSuccessMsg("Profile information saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg("");
    setTimeout(() => {
      setSavingSettings(false);
      setSuccessMsg("Account preferences updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const handleRevokeSession = (id) => {
    setSessionList(sessionList.filter((s) => s.id !== id));
  };

  const handleAvatarChange = () => {
    alert("Simulating file upload. In production, this opens a file explorer dialog to upload an image.");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
      
      {/* Left Card: Unified Profile Summary */}
      <div className="card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        textAlign: "center", 
        padding: "30px 24px",
        position: "sticky",
        top: "102px",
        height: "calc(100vh - 204px)",
        overflowY: "auto"
      }}>
        <div style={{ position: "relative", width: "110px", height: "110px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary-color)", fontSize: "36px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "3px solid var(--border-color)" }}>
          A
          <button 
            onClick={handleAvatarChange}
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "var(--transition)"
            }}
            title="Change Avatar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>

        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px", color: "var(--text-color)" }}>
          {firstName} {lastName}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>Super Admin</p>
        <span className="badge success" style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>Active Status</span>

        <div style={{ borderTop: "1px solid var(--border-color)", width: "100%", marginTop: "24px", paddingTop: "20px", textAlign: "left", fontSize: "13px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Designation</span>
            <strong style={{ color: "var(--text-color)" }}>Lead Operator</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Joined On</span>
            <strong style={{ color: "var(--text-color)" }}>June 15, 2026</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>2FA Auth</span>
            <strong style={{ color: tfaEnabled ? "var(--success-color)" : "var(--danger-color)" }}>
              {tfaEnabled ? "Enabled" : "Disabled"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Active Sessions</span>
            <strong style={{ color: "var(--text-color)" }}>{sessionList.length} Sessions</strong>
          </div>
        </div>
      </div>

      {/* Right Card: Tabs Configuration Card */}
      <div className="card" style={{ 
        padding: "30px",
        position: "sticky",
        top: "102px",
        height: "calc(100vh - 204px)",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* Tab Headers (Sticky layout) */}
        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-color)", marginBottom: "28px", flexShrink: 0, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "2px" }}>
          <button 
            type="button"
            onClick={() => handleTabChange("details")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "details" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "details" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Personal Details
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("security")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "security" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "security" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Security & Access
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("notifications")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "notifications" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "notifications" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Notifications Prefs
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("activity")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "activity" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "activity" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Activity History
          </button>
        </div>

        {/* Scrollable Content wrapper */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          
          {successMsg && (
            <div style={{ padding: "12px", backgroundColor: "var(--success-light)", color: "var(--success-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "600" }}>
              {successMsg}
            </div>
          )}

          {/* Tab 1: Personal Details Content */}
          {activeTab === "details" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Personal Bio</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  style={{ resize: "none", minHeight: "90px", fontFamily: "inherit" }}
                  required
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }} disabled={savingProfile}>
                  {savingProfile ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Security & Access */}
          {activeTab === "security" && (
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <h5 style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Two-Factor Authentication (2FA)</h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: "500px" }}>Protect your administrative panels from unauthorized password cracking by configuring multi-factor tokens.</p>
                </div>
                <label className="remember-me" style={{ gap: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={tfaEnabled} 
                    onChange={(e) => setTfaEnabled(e.target.checked)} 
                  />
                </label>
              </div>

              <div>
                <h5 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Active Device Sessions</h5>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Browser</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionList.map((session) => (
                        <tr key={session.id}>
                          <td><strong>{session.device}</strong></td>
                          <td>{session.browser}</td>
                          <td><code>{session.ip}</code></td>
                          <td>
                            <span className={`badge ${session.current ? "success" : "primary"}`}>
                              {session.current ? "Current" : "Active"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {session.current ? (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Secured</span>
                            ) : (
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)" }}
                                onClick={() => handleRevokeSession(session.id)}
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: "10px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }} disabled={savingSettings}>
                  {savingSettings ? "Saving Settings..." : "Save Configuration"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Notification Preferences */}
          {activeTab === "notifications" && (
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.leads} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, leads: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>New Contact Leads</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Receive instant email alerts when a user submits a contact form on the main website.</span>
                  </div>
                </label>

                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.backups} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, backups: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>Database Backup Alerts</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Send status reports upon completion of automated database backups.</span>
                  </div>
                </label>

                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.uptime} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, uptime: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>Uptime & Health Reports</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Send critical email notifications immediately if server latency drops or site health falls below 95%.</span>
                  </div>
                </label>
              </div>

              <div style={{ marginTop: "10px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }} disabled={savingSettings}>
                  {savingSettings ? "Saving Settings..." : "Save Configuration"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Activity History */}
          {activeTab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentActivities.map((act) => (
                <div key={act.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-color)" }}>
                  <div>
                    <h5 style={{ fontWeight: "600", fontSize: "14px", margin: "0 0 4px 0", color: "var(--text-color)" }}>{act.action}</h5>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target Area: <strong style={{ color: "var(--text-color)" }}>{act.target}</strong></span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>{act.time}</span>
                </div>
              ))}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <AdminLayout title="My Profile">
      <Suspense fallback={<div className="card">Loading Profile Workspace...</div>}>
        <ProfileContent />
      </Suspense>
    </AdminLayout>
  );
}
