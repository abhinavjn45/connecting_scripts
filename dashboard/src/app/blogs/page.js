"use client";

import AdminLayout from "../../components/AdminLayout";
import { useState } from "react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([
    { id: 1, title: "10 Essential SEO Tips to Boost Your Website's Ranking", author: "Ben Stokes", date: "16 Aug 2023", views: "1.2k" },
    { id: 2, title: "The Power of PPC Advertising: How to Maximize Your ROI", author: "Ben Stokes", date: "16 Aug 2023", views: "850" },
    { id: 3, title: "The Importance of Responsive Web Design in the Mobile Age", author: "Ben Stokes", date: "16 Aug 2023", views: "940" }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("Ben Stokes");
  
  const handleAddBlog = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const newBlog = {
      id: Date.now(),
      title: newTitle,
      author: newAuthor,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      views: "0"
    };
    setBlogs([newBlog, ...blogs]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  return (
    <AdminLayout title="Manage Blogs">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", color: "var(--text-muted)" }}>{blogs.length} articles found</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Blog
        </button>
      </div>

      <div className="widget">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published Date</th>
                <th>Views</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td><strong>{blog.title}</strong></td>
                  <td>{blog.author}</td>
                  <td>{blog.date}</td>
                  <td>{blog.views}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", marginRight: "8px" }}>Edit</button>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "var(--danger-color)" }} onClick={() => handleDelete(blog.id)}>Delete</button>
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
            <h2 className="widget-title" style={{ marginBottom: "20px" }}>Create Blog Post</h2>
            <form onSubmit={handleAddBlog}>
              <div className="form-group">
                <label>Blog Title</label>
                <input type="text" className="form-control" placeholder="Enter blog title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input type="text" className="form-control" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
