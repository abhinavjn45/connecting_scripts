"use client";

import { useState, useEffect, useRef } from "react";

const ROLES = ["Super Admin", "Admin", "Editor", "Viewer"];
const GENDERS = ["Male", "Female", "Others"];
const STATUSES = ["Active", "Inactive", "Suspended", "Pending"];

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  companyEmail: "",
  personalEmail: "",
  phoneNumber: "",
  bio: "",
  gender: "Others",
  designation: "",
  role: "Viewer",
  status: "Pending",
  joiningDate: new Date().toISOString().split("T")[0],
  password: "",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Failed to load users.");
      }
    } catch {
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || "",
      companyEmail: user.company_email || "",
      personalEmail: user.personal_email || "",
      phoneNumber: user.phone_number || "",
      bio: user.bio || "",
      gender: user.gender || "Others",
      designation: user.designation || "",
      role: user.role || "Viewer",
      status: user.status || "Pending",
      joiningDate: user.joining_date
        ? new Date(user.joining_date).toISOString().split("T")[0]
        : "",
      password: "",
    });
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setModalMsg({ type: "", text: "" });
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMsg({ type: "", text: "" });

    const token = localStorage.getItem("seoc_jwt_token");

    try {
      if (editingUser) {
        // Update mode
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setModalMsg({ type: "success", text: "User updated successfully." });
          fetchUsers();
          setTimeout(closeModal, 1500);
        } else {
          setModalMsg({ type: "error", text: data.message || "Failed to update user." });
        }
      } else {
        // Create mode
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setModalMsg({ type: "success", text: "User created successfully." });
          fetchUsers();
          setTimeout(closeModal, 1500);
        } else {
          setModalMsg({ type: "error", text: data.message || "Failed to create user." });
        }
      }
    } catch {
      setModalMsg({ type: "error", text: "Unable to connect to backend server." });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
        setDeleteTarget(null);
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch {
      alert("Unable to connect to backend server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered + searched users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.company_email || "").toLowerCase().includes(q) ||
      (u.personal_email || "").toLowerCase().includes(q) ||
      (u.designation || "").toLowerCase().includes(q);
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const statusBadgeClass = (status) => {
    const map = {
      Active: "success",
      Inactive: "warning",
      Suspended: "danger",
      Pending: "primary",
    };
    return map[status] || "primary";
  };

  return (
    <>
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
            Administrator Users
          </h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
            Manage agency dashboard accounts, roles, and access privileges.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
          style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <svg
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "40px", fontSize: "13px" }}
          />
        </div>

        <select
          className="form-input"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ flex: "0 1 160px", fontSize: "13px" }}
        >
          <option value="All">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          className="form-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ flex: "0 1 160px", fontSize: "13px" }}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <span style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <div
              style={{ width: "36px", height: "36px", border: "3px solid rgba(77,68,197,0.2)", borderTop: "3px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}
            />
            Loading users from database...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "12px", color: "var(--border-color)" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p style={{ margin: 0 }}>No users match your current filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "200px" }}>User</th>
                  <th style={{ minWidth: "220px" }}>Company Email</th>
                  <th style={{ minWidth: "220px" }}>Personal Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined On</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {/* User Cell: Avatar + Name + Username */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            overflow: "hidden",
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary-color)",
                            fontSize: "16px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid var(--border-color)",
                          }}
                        >
                          {user.profile_image ? (
                            <img src={user.profile_image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span>{(user.first_name || "U")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", display: "block", color: "var(--text-color)" }}>
                            {user.first_name} {user.last_name}
                          </strong>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            @{user.username}
                            {user.designation && <> · {user.designation}</>}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Company Email */}
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-color)" }}>
                        {user.company_email || "—"}
                      </span>
                    </td>

                    {/* Personal Email */}
                    <td>
                      <span style={{ fontSize: "13px", color: user.personal_email ? "var(--text-color)" : "var(--text-muted)", fontStyle: user.personal_email ? "normal" : "italic" }}>
                        {user.personal_email || "Not set"}
                      </span>
                    </td>

                    {/* Role */}
                    <td>
                      <span className="badge primary" style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${statusBadgeClass(user.status)}`} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>
                        {user.status}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {formatDate(user.joining_date)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => openEditModal(user)}
                          style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                          title="Edit User"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            backgroundColor: "var(--danger-light)",
                            color: "var(--danger-color)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "var(--transition)"
                          }}
                          title="Delete User"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="card"
            style={{
              width: "580px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
              padding: "28px", borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700" }}>
              {editingUser ? "Edit User Account" : "Create New User"}
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)" }}>
              {editingUser
                ? `Editing @${editingUser.username} — changes saved to database immediately.`
                : "Fill in the details below to create a new admin dashboard user."}
            </p>

            {modalMsg.text && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontWeight: "600",
                backgroundColor: modalMsg.type === "success" ? "var(--success-light)" : "var(--danger-light)",
                color: modalMsg.type === "success" ? "var(--success-color)" : "var(--danger-color)",
              }}>
                {modalMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>First Name *</label>
                  <input type="text" className="form-input" value={form.firstName} onChange={(e) => handleFormChange("firstName", e.target.value)} required style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Last Name *</label>
                  <input type="text" className="form-input" value={form.lastName} onChange={(e) => handleFormChange("lastName", e.target.value)} required style={{ fontSize: "13px" }} />
                </div>
              </div>

              {/* Username + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Username *</label>
                  <input type="text" className="form-input" value={form.username} onChange={(e) => handleFormChange("username", e.target.value)} required style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Phone Number</label>
                  <input type="text" className="form-input" value={form.phoneNumber} onChange={(e) => handleFormChange("phoneNumber", e.target.value)} placeholder="+1 555 000 0000" style={{ fontSize: "13px" }} />
                </div>
              </div>

              {/* Emails */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Company Email *</label>
                  <input type="email" className="form-input" value={form.companyEmail} onChange={(e) => handleFormChange("companyEmail", e.target.value)} required style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Personal Email</label>
                  <input type="email" className="form-input" value={form.personalEmail} onChange={(e) => handleFormChange("personalEmail", e.target.value)} placeholder="Optional" style={{ fontSize: "13px" }} />
                </div>
              </div>

              {/* Designation + Gender */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Designation</label>
                  <input type="text" className="form-input" value={form.designation} onChange={(e) => handleFormChange("designation", e.target.value)} placeholder="e.g. Lead Developer" style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Gender</label>
                  <select className="form-input" value={form.gender} onChange={(e) => handleFormChange("gender", e.target.value)} style={{ fontSize: "13px" }}>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Role + Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Role *</label>
                  <select className="form-input" value={form.role} onChange={(e) => handleFormChange("role", e.target.value)} style={{ fontSize: "13px" }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Status</label>
                  <select className="form-input" value={form.status} onChange={(e) => handleFormChange("status", e.target.value)} style={{ fontSize: "13px" }}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Joining Date */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Joining Date</label>
                <input type="date" className="form-input" value={form.joiningDate} onChange={(e) => handleFormChange("joiningDate", e.target.value)} style={{ fontSize: "13px" }} />
              </div>

              {/* Password - only shown for new users */}
              {!editingUser && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Password *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      value={form.password}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                      required
                      placeholder="Min. 8 chars"
                      style={{ fontSize: "13px", paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "12px" }}>Bio</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={form.bio}
                  onChange={(e) => handleFormChange("bio", e.target.value)}
                  placeholder="Short user biography..."
                  style={{ resize: "none", fontFamily: "inherit", fontSize: "13px" }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1, padding: "12px" }} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "12px" }} disabled={modalLoading}>
                  {modalLoading
                    ? (editingUser ? "Saving..." : "Creating...")
                    : (editingUser ? "Save Changes" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8,17,32,0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="card"
            style={{
              width: "400px", padding: "28px", borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700" }}>Delete User?</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              This will permanently delete <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> (@{deleteTarget.username}) and all their permission records. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "12px" }} disabled={deleteLoading}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  flex: 1, padding: "12px", fontSize: "14px", fontWeight: "600",
                  backgroundColor: "var(--danger-color)", color: "#fff",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  transition: "var(--transition)"
                }}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
