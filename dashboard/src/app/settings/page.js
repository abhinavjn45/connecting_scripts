"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    site_fullname: "",
    site_url: "",
    dashboard_url: "",
    timezone: "",
    footer_text: "",
    logo_main: "",
    logo_small: "",
    logo_small_dark: "",
    logo_light: "",
    logo_dark: "",
    android_chrome_192x192: "",
    android_chrome_512x512: "",
    apple_touch_icon: "",
    favicon_ico: "",
    favicon_16x16: "",
    favicon_32x32: "",
    social_facebook: "",
    social_twitter: "",
    social_linkedin: "",
    social_instagram: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalPhase, setModalPhase] = useState("idle"); // "loading" | "success" | "error"
  const [modalMsg, setModalMsg] = useState("");

  const [permissions, setPermissions] = useState({ read: true, update: true });

  useEffect(() => {
    const loadPermissions = () => {
      const stored = localStorage.getItem("cs_rbac_permissions");
      if (stored) {
        try {
          const perms = JSON.parse(stored);
          if (perms.settings) {
            setPermissions(perms.settings);
          }
        } catch (e) {}
      }
    };
    loadPermissions();
    window.addEventListener("rbac-update", loadPermissions);
    return () => window.removeEventListener("rbac-update", loadPermissions);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!permissions.update) {
      setModalPhase("error");
      setModalMsg("You do not have permission to update settings.");
      setShowModal(true);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingFiles(prev => ({ ...prev, [key]: file }));
    setPreviewUrls(prev => ({ ...prev, [key]: previewUrl }));
  };

  const initiateSave = () => {
    if (!permissions.update) {
      setModalPhase("error");
      setModalMsg("You do not have permission to update settings.");
      setShowModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleSaveConfirmed = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);
    setShowModal(true);
    setModalPhase("loading");
    setModalMsg("Uploading files and saving settings...");

    try {
      // 1. Upload pending files first
      const uploadedUrls = {};
      const pendingKeys = Object.keys(pendingFiles);
      
      for (let i = 0; i < pendingKeys.length; i++) {
        const key = pendingKeys[i];
        const file = pendingFiles[key];
        const formData = new FormData();
        formData.append("file", file);
        
        setModalMsg(`Uploading ${key}...`);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/assets/upload`, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const uploadData = await uploadRes.json();
        
        if (uploadRes.ok && uploadData.success) {
          uploadedUrls[key] = uploadData.url;
        } else {
          throw new Error(uploadData.message || `Failed to upload ${key}`);
        }
      }

      // Merge new URLs with existing settings
      const finalSettings = { ...settings, ...uploadedUrls };
      
      setModalMsg("Saving global settings to database...");

      // 2. Save settings
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSettings),
        credentials: "include"
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSettings(finalSettings);
        setPendingFiles({});
        setPreviewUrls({});
        setModalPhase("success");
        setModalMsg("Settings saved successfully!");
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setModalPhase("error");
        setModalMsg(data.message || "Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      setModalPhase("error");
      setModalMsg(err.message || "Network error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!permissions.read) {
    return (
      <AdminLayout title="Access Denied">
        <div className="card-container">
          <p style={{ color: "var(--danger-color)", padding: "20px" }}>You do not have permission to view site settings.</p>
        </div>
      </AdminLayout>
    );
  }

  const renderImageUpload = (label, key, helperText) => {
    const displayUrl = previewUrls[key] || settings[key];
    return (
      <div className="form-group" style={{ marginBottom: "24px" }}>
        <label className="form-label">{label}</label>
        {helperText && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{helperText}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {displayUrl ? (
            <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", background: "var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
              <img src={displayUrl} alt={label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "var(--bg-color)", border: "1px dashed var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "var(--text-muted)" }}>
              None
            </div>
          )}
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="form-input" 
              name={key} 
              value={settings[key]} 
              onChange={handleChange} 
              placeholder="Or enter image URL..."
              style={{ marginBottom: "8px" }}
              disabled={!!previewUrls[key]}
            />
            <input type="file" accept=".svg,image/*" onChange={(e) => handleFileUpload(e, key)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="Site Settings">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "700" }}>
            Site Settings
          </h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
            Manage global site configuration, branding, and assets.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: "24px 30px" }}>
        {/* Custom Tabs */}
        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-color)", marginBottom: "28px", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "2px" }}>
          {["general", "branding", "favicons", "social"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0 4px 12px 4px",
                fontSize: "14px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--primary-color)" : "2px solid transparent",
                color: activeTab === tab ? "var(--text-color)" : "var(--text-muted)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "var(--transition)",
                textTransform: "capitalize"
              }}
            >
              {tab === "general" ? "General Settings" : tab === "favicons" ? "Favicon Setup" : tab === "social" ? "Social Links" : "Branding Assets"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading settings...</div>
        ) : (
          <div style={{ maxWidth: "800px" }}>
            {activeTab === "general" && (
              <div className="tab-content fade-in">
                <div className="form-group">
                  <label className="form-label">Site Fullname (Internal Reference)</label>
                  <input type="text" className="form-input" name="site_fullname" value={settings.site_fullname} onChange={handleChange} placeholder="e.g. Connecting Scripts" />
                </div>
                <div className="form-group">
                  <label className="form-label">Public Site URL</label>
                  <input type="text" className="form-input" name="site_url" value={settings.site_url} onChange={handleChange} placeholder="https://example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Dashboard URL</label>
                  <input type="text" className="form-input" name="dashboard_url" value={settings.dashboard_url} onChange={handleChange} placeholder="https://admin.example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sitewide Timezone</label>
                  <select className="form-input" name="timezone" value={settings.timezone} onChange={handleChange}>
                    <option value="">Select Timezone...</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Footer Copyright Text</label>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Supports placeholders: {"{site_fullname}"}, {"{current_year}"}</div>
                  <input type="text" className="form-input" name="footer_text" value={settings.footer_text} onChange={handleChange} placeholder="© {current_year} {site_fullname}. All rights reserved." />
                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="tab-content fade-in">
                {renderImageUpload("Main Logo", "logo_main", "Primary logo used across the site.")}
                {renderImageUpload("Light Theme Logo", "logo_light", "Alternative logo for light backgrounds.")}
                {renderImageUpload("Dark Theme Logo", "logo_dark", "Alternative logo for dark backgrounds.")}
                {renderImageUpload("Small Logo (Icon)", "logo_small", "Square or compact version of the logo.")}
                {renderImageUpload("Dark Theme Small Logo", "logo_small_dark", "Square or compact version for dark theme.")}
              </div>
            )}

            {activeTab === "favicons" && (
              <div className="tab-content fade-in">
                <div style={{ marginBottom: "24px", fontSize: "14px", color: "var(--text-muted)", padding: "12px", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  Upload explicit files for each platform variant.
                </div>
                {renderImageUpload("android-chrome-192x192.png", "android_chrome_192x192")}
                {renderImageUpload("android-chrome-512x512.png", "android_chrome_512x512")}
                {renderImageUpload("apple-touch-icon.png", "apple_touch_icon")}
                {renderImageUpload("favicon.ico", "favicon_ico")}
                {renderImageUpload("favicon-16x16.png", "favicon_16x16")}
                {renderImageUpload("favicon-32x32.png", "favicon_32x32")}
              </div>
            )}

            {activeTab === "social" && (
              <div className="tab-content fade-in">
                <div className="form-group">
                  <label className="form-label">Facebook URL</label>
                  <input type="url" className="form-input" name="social_facebook" value={settings.social_facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter / X URL</label>
                  <input type="url" className="form-input" name="social_twitter" value={settings.social_twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input type="url" className="form-input" name="social_linkedin" value={settings.social_linkedin} onChange={handleChange} placeholder="https://linkedin.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram URL</label>
                  <input type="url" className="form-input" name="social_instagram" value={settings.social_instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card-footer" style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <button 
            className="btn btn-primary" 
            onClick={initiateSave} 
            disabled={isSaving || !permissions.update}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card" style={{
            width: "400px",
            padding: "32px",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(234, 179, 8, 0.1)",
              color: "#eab308",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: "700" }}>Confirm Changes</h3>
            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.5" }}>
              You are about to save changes to critical global site settings. Are you sure you want to proceed?
            </p>
            <div style={{ display: "flex", gap: "16px", width: "100%" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: "12px" }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveConfirmed}
                style={{ flex: 1, padding: "12px", backgroundColor: "var(--primary-color)" }}
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Modal Overlay */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card" style={{
            width: "360px",
            padding: "24px",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "260px",
            justifyContent: "center"
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", textAlign: "center", width: "100%" }}>
              {modalPhase === "loading" && (
                <div className="spinner-loader" style={{ width: "60px", height: "60px", border: "4px solid rgba(77, 68, 197, 0.15)", borderTop: "4px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "20px" }}></div>
              )}
              
              {modalPhase === "success" && (
                <svg className="animated-tick" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--success-color)", strokeMiterlimit: "10", boxShadow: "inset 0px 0px 0px var(--success-color)", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                  <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--success-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                  <path className="tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ transformOrigin: "50% 50%", strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--success-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                </svg>
              )}

              {modalPhase === "error" && (
                <svg className="animated-cross" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--danger-color)", strokeMiterlimit: "10", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                  <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--danger-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                  <path className="tick-check" fill="none" d="M16 16l20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .4s forwards" }} />
                  <path className="tick-check" fill="none" d="M36 16l-20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                </svg>
              )}

              <p style={{ margin: "0 0 24px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)", lineHeight: "1.5" }}>{modalMsg}</p>

              {modalPhase === "error" && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 24px", fontSize: "12px", minWidth: "140px" }}
                >
                  Go Back & Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes strokeCircle {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes strokeCheck {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scaleTick {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
      `}</style>

    </AdminLayout>
  );
}
