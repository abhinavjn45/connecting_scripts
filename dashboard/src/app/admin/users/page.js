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
  permissions: {}
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("joined_on");
  const [sortOrder, setSortOrder] = useState("DESC");

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

  const [availableModules, setAvailableModules] = useState([]);

  // Local CRUD Permission status for the Users Module
  const [crudPermissions, setCrudPermissions] = useState({
    read: true,
    create: true,
    update: true,
    delete: true
  });

  const triggerActionCheck = (actionType) => {
    if (!crudPermissions[actionType]) {
      alert(`Access Denied: You do not have permission to ${actionType.toUpperCase()} entries in the Users module.`);
      return false;
    }
    return true;
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: debouncedSearch,
        role: filterRole,
        status: filterStatus,
        sortBy,
        sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
        setTotalUsers(data.total || 0);
      } else {
        setError(data.message || "Failed to load users.");
      }
    } catch {
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterRole, filterStatus, limit, sortBy, sortOrder]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [page, limit, debouncedSearch, filterRole, filterStatus, sortBy, sortOrder]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/modules`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvailableModules(data.modules);
      }
    } catch (err) {
      console.error("Failed to load modules", err);
    }
  };

  useEffect(() => {
    fetchModules();

    const loadPermissions = () => {
      const stored = localStorage.getItem("cs_rbac_permissions");
      if (stored) {
        try {
          const perms = JSON.parse(stored);
          if (perms.users) {
            setCrudPermissions(perms.users);
          }
        } catch (e) {}
      }
    };
    loadPermissions();
    window.addEventListener("rbac-update", loadPermissions);
    return () => window.removeEventListener("rbac-update", loadPermissions);
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    const perms = {};
    availableModules.forEach(mod => {
      perms[mod.module_key] = { read: false, create: false, update: false, delete: false };
    });
    setForm({ ...emptyForm, permissions: perms });
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = async (user) => {
    setEditingUser(user);
    const perms = {};
    availableModules.forEach(mod => {
      perms[mod.module_key] = { read: false, create: false, update: false, delete: false };
    });

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
      permissions: perms // Default until loaded
    });
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
    setModalLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success && data.user.permissions) {
        setForm(prev => ({
          ...prev,
          permissions: { ...perms, ...data.user.permissions }
        }));
      }
    } catch (err) {
      console.error("Failed to load user permissions", err);
    } finally {
      setModalLoading(false);
    }
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

  const handlePermissionChange = (moduleKey, action, value) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [action]: value
        }
      }
    }));
  };

  const handleToggleModulePermissions = (moduleKey, checked) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          read: checked,
          create: checked,
          update: checked,
          delete: checked
        }
      }
    }));
  };

  const handleToggleAllPermissions = (checked) => {
    setForm(prev => {
      const newPerms = { ...prev.permissions };
      availableModules.forEach(mod => {
        newPerms[mod.module_key] = {
          read: checked,
          create: checked,
          update: checked,
          delete: checked
        };
      });
      return { ...prev, permissions: newPerms };
    });
  };

  const isModuleFullyChecked = (moduleKey) => {
    return ["read", "create", "update", "delete"].every(action => form.permissions[moduleKey]?.[action]);
  };

  const isAllPermissionsChecked = availableModules.length > 0 && availableModules.every(mod => 
    ["read", "create", "update", "delete"].every(action => 
      form.permissions[mod.module_key]?.[action]
    )
  );

  const handleResetForm = () => {
    if (editingUser) {
      openEditModal(editingUser);
    } else {
      openCreateModal();
    }
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure at least one uppercase, lowercase, number and special char to pass any strict validation if added later
    pass = "A1a!" + pass.slice(4); 
    handleFormChange("password", pass);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMsg({ type: "", text: "" });

    const token = localStorage.getItem("cs_jwt_token");

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

  // Filtered + searched users logic moved to backend
  const filteredUsers = users;

  const statusBadgeClass = (status) => {
    const map = {
      Active: "success",
      Inactive: "warning",
      Suspended: "danger",
      Pending: "primary",
    };
    return map[status] || "primary";
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const renderSortIndicator = (column) => {
    if (sortBy !== column) return <span style={{ opacity: 0.2, marginLeft: "4px" }}>↕</span>;
    return <span style={{ marginLeft: "4px", color: "var(--primary-color)", fontWeight: "bold" }}>{sortOrder === "ASC" ? "↑" : "↓"}</span>;
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
        {crudPermissions.create && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreateModal()}
            style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New User
          </button>
        )}
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
          {totalUsers} {totalUsers === 1 ? "user" : "users"} found
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflowX: "auto", overflowY: "hidden" }}>
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
            <table className="custom-table" style={{ minWidth: "1200px" }}>
              <thead>
                <tr>
                  <th className="sticky-col-left" style={{ minWidth: "200px", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('user')}>User {renderSortIndicator('user')}</th>
                  <th style={{ minWidth: "220px", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('company_email')}>Company Email {renderSortIndicator('company_email')}</th>
                  <th style={{ minWidth: "220px", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('personal_email')}>Personal Email {renderSortIndicator('personal_email')}</th>
                  <th style={{ minWidth: "160px", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('phone_number')}>Phone Number {renderSortIndicator('phone_number')}</th>
                  <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('role')}>Role {renderSortIndicator('role')}</th>
                  <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('status')}>Status {renderSortIndicator('status')}</th>
                  <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('joined_on')}>Joined On {renderSortIndicator('joined_on')}</th>
                  {(crudPermissions.update || crudPermissions.delete) && <th className="sticky-col-right" style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {/* User Cell: Avatar + Name + Username */}
                    <td className="sticky-col-left">
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
                      <span style={{ fontSize: "13px" }}>
                        {user.company_email ? <a href={`mailto:${user.company_email}`} style={{ color: "var(--primary-color)", textDecoration: "none" }}>{user.company_email}</a> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </span>
                    </td>

                    {/* Personal Email */}
                    <td>
                      <span style={{ fontSize: "13px", fontStyle: user.personal_email ? "normal" : "italic" }}>
                        {user.personal_email ? <a href={`mailto:${user.personal_email}`} style={{ color: "var(--primary-color)", textDecoration: "none" }}>{user.personal_email}</a> : <span style={{ color: "var(--text-muted)" }}>Not set</span>}
                      </span>
                    </td>

                    {/* Phone Number */}
                    <td>
                      <span style={{ fontSize: "13px", fontStyle: user.phone_number ? "normal" : "italic" }}>
                        {user.phone_number ? <a href={`tel:${user.phone_number}`} style={{ color: "var(--primary-color)", textDecoration: "none" }}>{user.phone_number}</a> : <span style={{ color: "var(--text-muted)" }}>Not set</span>}
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
                    {(crudPermissions.update || crudPermissions.delete) && (
                      <td className="sticky-col-right" style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {crudPermissions.update && (
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
                        )}
                        {crudPermissions.delete && (
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
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Rows per page:</span>
          <select 
            className="form-input" 
            style={{ padding: "6px 28px 6px 12px", fontSize: "13px", width: "auto", minHeight: "0" }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>
            {totalUsers > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, totalUsers)} of {totalUsers}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: "6px 10px", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: "6px 10px", opacity: page * limit >= totalUsers ? 0.5 : 1, cursor: page * limit >= totalUsers ? "not-allowed" : "pointer" }}
              disabled={page * limit >= totalUsers}
              onClick={() => setPage(p => p + 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
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
              width: "900px", maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden",
              padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700" }}>
                  {editingUser ? "Edit User Account" : "Create New User"}
                </h3>
                <p style={{ margin: "0", fontSize: "13px", color: "var(--text-muted)" }}>
                  {editingUser
                    ? `Editing @${editingUser.username} — changes saved to database immediately.`
                    : "Fill in the details below to create a new admin dashboard user."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {modalMsg.text && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px", margin: "16px 28px 0", fontSize: "13px", fontWeight: "600", flexShrink: 0,
                backgroundColor: modalMsg.type === "success" ? "var(--success-light)" : "var(--danger-light)",
                color: modalMsg.type === "success" ? "var(--success-color)" : "var(--danger-color)",
              }}>
                {modalMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", padding: "24px 28px 0 28px", overflow: "hidden", flex: 1, alignItems: "stretch" }}>
                {/* Left Column: Details */}
                <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", height: "100%", paddingRight: "12px", paddingBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                    <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>User Details</h4>
                  </div>
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
                      style={{ fontSize: "13px", paddingRight: "65px" }}
                    />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={generateRandomPassword}
                        title="Generate Random Password"
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
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

              </div>

              {/* Right Column: Permissions */}
              <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", height: "100%", paddingRight: "12px", paddingBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                  <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>Module Access Permissions</h4>
                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-muted)", fontWeight: "600" }}>
                    <input
                      type="checkbox"
                      checked={isAllPermissionsChecked}
                      onChange={(e) => handleToggleAllPermissions(e.target.checked)}
                      style={{ width: "14px", height: "14px", cursor: "pointer", accentColor: "var(--primary-color)" }}
                    />
                    Select All
                  </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {availableModules.map(mod => (
                    <div key={mod.module_key} style={{ padding: "12px", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <strong style={{ fontSize: "13px", color: "var(--text-color)" }}>
                          {mod.module_name}
                        </strong>
                        <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-muted)" }}>
                          <input
                            type="checkbox"
                            checked={isModuleFullyChecked(mod.module_key)}
                            onChange={(e) => handleToggleModulePermissions(mod.module_key, e.target.checked)}
                            style={{ width: "13px", height: "13px", cursor: "pointer", accentColor: "var(--primary-color)" }}
                          />
                          All
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {["read", "create", "update", "delete"].map(action => (
                          <label key={action} style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-muted)" }}>
                            <input
                              type="checkbox"
                              checked={form.permissions[mod.module_key]?.[action] || false}
                              onChange={(e) => handlePermissionChange(mod.module_key, action, e.target.checked)}
                              style={{ width: "14px", height: "14px", cursor: "pointer", accentColor: "var(--primary-color)" }}
                            />
                            <span style={{ textTransform: "capitalize" }}>{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
              {/* Actions Footer */}
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", flexShrink: 0, display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1, justifySelf: "center" }} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="button" className="btn btn-outline" onClick={handleResetForm} style={{ flex: 1, display: "flex", justifyContent: "center" }} disabled={modalLoading}>
                  Reset
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, opacity: modalLoading ? 0.7 : 1, cursor: modalLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={modalLoading}>
                  {modalLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      {editingUser ? "Saving..." : "Creating..."}
                    </>
                  ) : (editingUser ? "Save Changes" : "Create User")}
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
                  border: "none", borderRadius: "8px", cursor: deleteLoading ? "not-allowed" : "pointer", opacity: deleteLoading ? 0.7 : 1,
                  transition: "var(--transition)", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {deleteLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                    Deleting...
                  </>
                ) : "Yes, Delete"}
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
