"use client";

import AdminLayout from "../../components/AdminLayout";
import { useState } from "react";

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState([
    { id: 1, title: "Comprehensive SEO Audit", category: "SEO", client: "Google LLC", date: "12 May 2024" },
    { id: 2, title: "Keyword Research & Analysis", category: "Web", client: "John Smith", date: "12 May 2024" },
    { id: 3, title: "One Page Optimization", category: "PPC", client: "Netflix Inc.", date: "10 May 2024" }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SEO");
  const [newClient, setNewClient] = useState("");

  const handleAddCaseStudy = (e) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;
    const newCase = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      client: newClient,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setCaseStudies([newCase, ...caseStudies]);
    setNewTitle("");
    setNewClient("");
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCaseStudies(caseStudies.filter(c => c.id !== id));
  };

  return (
    <AdminLayout title="Manage Case Studies">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", color: "var(--text-muted)" }}>{caseStudies.length} items found</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Case Study
        </button>
      </div>

      <div className="widget">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Category</th>
                <th>Client</th>
                <th>Created Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caseStudies.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.title}</strong></td>
                  <td><span className="badge primary">{item.category}</span></td>
                  <td>{item.client}</td>
                  <td>{item.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", marginRight: "8px" }}>Edit</button>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "var(--danger-color)" }} onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="widget" style={{ width: "100%", maxWidth: "500px", margin: "20px" }}>
            <h2 className="widget-title" style={{ marginBottom: "20px" }}>Create Case Study</h2>
            <form onSubmit={handleAddCaseStudy}>
              <div className="form-group">
                <label>Project Title</label>
                <input type="text" className="form-control" placeholder="Enter project title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="SEO">SEO</option>
                  <option value="Branding">Branding</option>
                  <option value="Digital PR">Digital PR</option>
                  <option value="PPC">PPC</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Web">Web</option>
                </select>
              </div>
              <div className="form-group">
                <label>Client</label>
                <input type="text" className="form-control" placeholder="Enter client name" value={newClient} onChange={(e) => setNewClient(e.target.value)} required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
