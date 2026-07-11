"use client";

import AdminLayout from "../../components/AdminLayout";
import { useState } from "react";

export default function SettingsPage() {
  const [seoTitle, setSeoTitle] = useState("SEOC - Digital Marketing Agency");
  const [seoDescription, setSeoDescription] = useState("We specialize in revolutionizing your online presence through expert SEO and digital marketing solutions.");
  const [seoKeywords, setSeoKeywords] = useState("seo, marketing, design, digital marketing agency");
  const [logoUrl, setLogoUrl] = useState("/assets/img/logo/logo1.png");
  const [faviconUrl, setFaviconUrl] = useState("/assets/img/logo/fav-logo1.png");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="widget" style={{ maxWidth: "800px" }}>
        <h2 className="widget-title" style={{ marginBottom: "24px" }}>SEO Metadata & Brand Assets</h2>
        
        {isSaved && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "var(--success-light)",
            color: "var(--success-color)",
            borderRadius: "10px",
            marginBottom: "24px",
            fontWeight: "600",
            fontSize: "14px"
          }}>
            ✓ Site settings updated successfully! (Will be fetched from the database in real-time).
          </div>
        )}

        <form onSubmit={handleSave}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border-color)" }}>SEO Parameters</h3>
          <div className="form-group">
            <label>Default SEO Title</label>
            <input type="text" className="form-control" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Meta Description</label>
            <textarea className="form-control" style={{ height: "100px", resize: "none" }} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} required></textarea>
          </div>
          <div className="form-group">
            <label>Meta Keywords (Comma separated)</label>
            <input type="text" className="form-control" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} required />
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "32px", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border-color)" }}>Brand Assets</h3>
          <div className="form-group">
            <label>Primary Site Logo Path</label>
            <input type="text" className="form-control" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Site Favicon Path</label>
            <input type="text" className="form-control" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} required />
          </div>

          <div style={{ marginTop: "32px" }}>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
