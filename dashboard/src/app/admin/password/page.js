"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';

const AUTH_TYPES = ["password", "oauth"];
const emptyForm = {
  title: "",
  url: "",
  username: "",
  authType: "password",
  oauthProvider: "",
  password: "",
  notes: "",
  assignedUsers: [] // Array of user IDs
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

export default function PasswordManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState({ id: null, role: "" });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [assignedUsersDetails, setAssignedUsersDetails] = useState([]); // Array of user objects {id, name, email}

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Password Modal
  const [viewPasswordData, setViewPasswordData] = useState(null);

  // Authorization Modal
  const [authModalConfig, setAuthModalConfig] = useState(null); // { item, action }
  const [authTab, setAuthTab] = useState("password"); // 'password' | 'otp'
  const [authValue, setAuthValue] = useState(""); // For dashboard password
  const [authOtp, setAuthOtp] = useState(["", "", "", "", "", ""]); // For 6-box OTP
  const authOtpRefs = useRef([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState({ type: "", text: "" });
  const [otpSent, setOtpSent] = useState(false);

  // Tooltip States
  const [copiedUsernameId, setCopiedUsernameId] = useState(null);
  const [hoverUsernameId, setHoverUsernameId] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const clipboardClearTimeRef = useRef(null);

  const fetchVaultItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items);
      } else {
        setError(data.message || "Failed to load vault items.");
      }
    } catch (err) {
      setError("Network error fetching vault items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUserInfo({
      id: Number(localStorage.getItem("cs_user_id")),
      role: localStorage.getItem("cs_rbac_role")
    });
    fetchVaultItems();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && clipboardClearTimeRef.current) {
        if (Date.now() >= clipboardClearTimeRef.current) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('').catch(() => {});
          }
          clipboardClearTimeRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Filter items based on local search
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNew = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setAssignedUsersDetails([]);
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
  };

  const fetchAssignedUsers = async (itemId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/${itemId}/access`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAssignedUsersDetails(data.assignedUsers.map(u => ({
          id: u.id, 
          name: `${u.first_name} ${u.last_name}`, 
          email: u.company_email || u.username
        })));
        setForm(prev => ({ ...prev, assignedUsers: data.assignedUsers.map(u => u.id) }));
      }
    } catch(err) {
      console.error("Failed to fetch assigned users");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      url: item.url || "",
      username: item.username || "",
      authType: item.auth_type || "password",
      oauthProvider: item.oauth_provider || "",
      password: "", // We never send the password down on fetch
      notes: item.notes || "",
      assignedUsers: [] // will fetch
    });
    setAssignedUsersDetails([]);
    setModalMsg({ type: "", text: "" });
    setShowPassword(false);
    setShowModal(true);
    fetchAssignedUsers(item.id);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMsg({ type: "", text: "" });

    try {
      const url = editingItem 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/${editingItem.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault`;
      
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setModalMsg({ type: "success", text: data.message });
        fetchVaultItems();
        setTimeout(() => {
          setShowModal(false);
        }, 1000);
      } else {
        setModalMsg({ type: "error", text: data.message || "Failed to save item." });
      }
    } catch (err) {
      setModalMsg({ type: "error", text: "Network error saving item." });
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(items.filter(i => i.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRevealPassword = (item, action = 'viewed_password') => {
    setAuthModalConfig({ item, action });
    setAuthTab("password");
    setAuthValue("");
    setAuthOtp(["", "", "", "", "", ""]);
    setAuthMsg({ type: "", text: "" });
    setOtpSent(false);
  };

  const handleCopyUsername = (username, id) => {
    if (!username) return;
    navigator.clipboard.writeText(username);
    setCopiedUsernameId(id);
    setTimeout(() => setCopiedUsernameId(null), 2000);
  };

  const handleCopyModalPassword = (password) => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
    
    clipboardClearTimeRef.current = Date.now() + 20000;
    
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        clipboardClearTimeRef.current = null;
      }
    }, 20000); // Clear clipboard after 20s
  };

  const handleAuthOtpChange = (e, index) => {
    const val = e.target.value;
    const newOtp = [...authOtp];
    newOtp[index] = val ? val.slice(-1) : "";
    setAuthOtp(newOtp);
    if (val && index < 5 && authOtpRefs.current[index + 1]) {
      authOtpRefs.current[index + 1].focus();
    }
  };

  const handleAuthOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!authOtp[index] && index > 0) {
        const newOtp = [...authOtp];
        newOtp[index - 1] = "";
        setAuthOtp(newOtp);
        authOtpRefs.current[index - 1].focus();
      }
    }
  };

  const requestVaultOtp = async () => {
    setAuthLoading(true);
    setAuthMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/request-otp`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setAuthMsg({ type: "success", text: "OTP sent to your email! (Valid for 5 mins)" });
      } else {
        setAuthMsg({ type: "error", text: data.message || "Failed to send OTP." });
      }
    } catch (err) {
      setAuthMsg({ type: "error", text: "Network error sending OTP." });
    } finally {
      setAuthLoading(false);
    }
  };

  const submitAuthAndReveal = async (e) => {
    e.preventDefault();
    
    const submittedOtp = authOtp.join("");
    if (authTab === "password" && !authValue) return;
    if (authTab === "otp" && submittedOtp.length !== 6) return;
    if (!authModalConfig) return;
    
    setAuthLoading(true);
    setAuthMsg({ type: "", text: "" });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/${authModalConfig.item.id}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: authModalConfig.action,
          authMethod: authTab,
          authValue: authTab === "password" ? authValue : submittedOtp
        })
      });
      const data = await res.json();
      if (data.success) {
        setViewPasswordData({ ...authModalConfig.item, password: data.password });
        setAuthModalConfig(null);
      } else {
        setAuthMsg({ type: "error", text: data.message || "Authorization failed." });
      }
    } catch (err) {
      setAuthMsg({ type: "error", text: "Network error during authorization." });
    } finally {
      setAuthLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
    setShowPassword(true);
  };

  // User Search logic
  useEffect(() => {
    if (userSearchQuery.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vault/users/search?q=${userSearchQuery}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          // Filter out users already assigned
          const filtered = data.users.filter(u => !form.assignedUsers.includes(u.id));
          setUserSearchResults(filtered);
        }
      } catch(err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearchQuery, form.assignedUsers]);

  const addUserToItem = (user) => {
    setForm(prev => ({ ...prev, assignedUsers: [...prev.assignedUsers, user.id] }));
    setAssignedUsersDetails(prev => [...prev, { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.company_email || user.username }]);
    setUserSearchQuery("");
    setUserSearchResults([]);
  };

  const removeUserFromItem = (idToRemove) => {
    setForm(prev => ({ ...prev, assignedUsers: prev.assignedUsers.filter(id => id !== idToRemove) }));
    setAssignedUsersDetails(prev => prev.filter(u => u.id !== idToRemove));
  };

  return (
    <>
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
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "700" }}>Password Manager</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Securely manage and share agency credentials.</p>
        </div>
        <button type="button" onClick={handleCreateNew} className="btn btn-primary" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Credential
        </button>
      </div>

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
          <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search credentials by title or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "40px", fontSize: "13px", width: "100%" }}
          />
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflowX: "auto", overflowY: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid rgba(77,68,197,0.2)", borderTop: "3px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            Loading credentials from database...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "12px", color: "var(--border-color)" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p style={{ margin: 0 }}>No credentials match your current filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ minWidth: "1000px" }}>
              <thead>
                <tr>
                  <th className="sticky-col-left" style={{ minWidth: "200px" }}>Title</th>
                  <th style={{ minWidth: "220px" }}>URL</th>
                  <th style={{ minWidth: "200px" }}>Username</th>
                  <th style={{ minWidth: "150px" }}>Type</th>
                  <th style={{ minWidth: "120px" }}>Created</th>
                  <th className="sticky-col-right" style={{ textAlign: "right", minWidth: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="sticky-col-left">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "8px",
                            flexShrink: 0,
                            overflow: "hidden",
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid var(--border-color)",
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", display: "block", color: "var(--text-color)" }}>
                            {item.title}
                          </strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", fontStyle: item.url ? "normal" : "italic" }}>
                        {item.url ? <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary-color)", textDecoration: "none" }}>{item.url}</a> : <span style={{ color: "var(--text-muted)" }}>Not set</span>}
                      </span>
                    </td>
                    <td>
                      {item.username ? (
                        <div 
                          style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
                          onClick={() => handleCopyUsername(item.username, item.id)}
                          onMouseEnter={() => setHoverUsernameId(item.id)}
                          onMouseLeave={() => setHoverUsernameId(null)}
                        >
                          <span style={{ fontSize: "13px" }}>{item.username}</span>
                          {(hoverUsernameId === item.id || copiedUsernameId === item.id) && (
                            <div style={{
                              position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                              marginBottom: "6px", padding: "4px 8px", 
                              backgroundColor: copiedUsernameId === item.id ? "var(--success-color)" : "var(--primary-color)",
                              color: "#fff", fontSize: "11px", borderRadius: "6px", whiteSpace: "nowrap", zIndex: 10,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)", pointerEvents: "none", fontWeight: "600",
                              animation: "fadeIn 0.15s ease-out"
                            }}>
                              {copiedUsernameId === item.id ? "Copied!" : "Click to copy"}
                              <div style={{
                                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                                borderWidth: "5px", borderStyle: "solid",
                                borderColor: `${copiedUsernameId === item.id ? "var(--success-color)" : "var(--primary-color)"} transparent transparent transparent`
                              }} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>Not set</span>
                      )}
                    </td>
                    <td>
                      {item.auth_type === 'oauth' ? (
                        <span className="badge warning" style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>
                          OAuth: {item.oauth_provider}
                        </span>
                      ) : (
                        <span className="badge success" style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>
                          Password
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="sticky-col-right" style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {item.auth_type === 'password' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => handleRevealPassword(item, 'viewed_password')}
                              style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                              title="View Password"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              View
                            </button>
                          </>
                        )}
                        { (currentUserInfo.role === 'Super Admin' || item.added_by === currentUserInfo.id) && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleEdit(item)}
                            style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                            title="Edit"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Edit
                          </button>
                        )}
                        { (currentUserInfo.role === 'Super Admin' || item.added_by === currentUserInfo.id) && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
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
                            title="Delete"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
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
              width: "700px", maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden",
              padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700" }}>
                  {editingItem ? "Edit Credential" : "Add New Credential"}
                </h3>
                <p style={{ margin: "0", fontSize: "13px", color: "var(--text-muted)" }}>
                  {editingItem
                    ? `Editing "${editingItem.title}" — changes saved to database immediately.`
                    : "Fill in the details below to securely store a new credential in the vault."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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

            <form id="vaultForm" onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", padding: "24px 28px" }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Title *</label>
                  <input type="text" className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Hostinger CPanel" style={{ fontSize: "13px" }} />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px" }}>URL</label>
                    <input type="url" className="form-input" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." style={{ fontSize: "13px" }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px" }}>Username / Email</label>
                    <input type="text" className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} style={{ fontSize: "13px" }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Authentication Type</label>
                  <select className="form-input" value={form.authType} onChange={e => setForm({...form, authType: e.target.value})} style={{ fontSize: "13px" }}>
                    <option value="password">Standard Password</option>
                    <option value="oauth">OAuth / SSO (No Password)</option>
                  </select>
                </div>

                {form.authType === 'oauth' ? (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px" }}>OAuth Provider</label>
                    <input type="text" className="form-input" value={form.oauthProvider} onChange={e => setForm({...form, oauthProvider: e.target.value})} placeholder="e.g. Google, GitHub, Apple" style={{ fontSize: "13px" }} />
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px" }}>Password {editingItem ? "(Leave blank to keep existing)" : "*"}</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-input" 
                        value={form.password} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                        required={!editingItem}
                        style={{ flex: 1, fontSize: "13px" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-secondary" style={{ padding: "0 12px", fontSize: "12px" }}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <button type="button" onClick={generatePassword} className="btn btn-secondary" style={{ padding: "0 12px", whiteSpace: "nowrap", fontSize: "12px" }}>
                        Generate
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Notes (Optional)</label>
                  <textarea className="form-input" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ resize: "none", fontFamily: "inherit", fontSize: "13px" }}></textarea>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", margin: "8px 0" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>Access Control</h4>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>Search and explicitly assign users who can view this credential.</p>

                <div className="form-group" style={{ position: "relative", marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Search Users</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search by name, email, phone..." 
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    style={{ fontSize: "13px" }}
                  />
                  {userSearchResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "8px", zIndex: 10, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                      {userSearchResults.map(u => (
                        <div 
                          key={u.id} 
                          onClick={() => addUserToItem(u)}
                          style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-color)", cursor: "pointer", display: "flex", flexDirection: "column" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span style={{ fontWeight: 500, fontSize: "13px" }}>{u.first_name} {u.last_name}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.company_email || u.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {assignedUsersDetails.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {assignedUsersDetails.map(u => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "var(--bg-color)", borderRadius: "20px", fontSize: "13px", border: "1px solid var(--border-color)" }}>
                        <span>{u.name}</span>
                        <button type="button" onClick={() => removeUserFromItem(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {assignedUsersDetails.length === 0 && (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0" }}>No specific users assigned. Only you and Super Admins will see this.</p>
                )}
              </div>
              
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", flexShrink: 0, display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, justifySelf: "center" }} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, opacity: modalLoading ? 0.7 : 1, cursor: modalLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={modalLoading}>
                  {modalLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      {editingItem ? "Saving..." : "Creating..."}
                    </>
                  ) : (editingItem ? "Save Changes" : "Save Credential")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
            <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700" }}>Delete Credential?</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              This will permanently delete the credential <strong>{deleteTarget.title}</strong> and all its access records. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "12px" }} disabled={deleteLoading}>
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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

      {/* VIEW PASSWORD MODAL */}
      {viewPasswordData && (
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
              width: "400px", maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden",
              padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700" }}>
                  {viewPasswordData.title}
                </h3>
                <p style={{ margin: "0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Your decrypted password is shown below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewPasswordData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ fontSize: "12px", margin: 0 }}>Revealed Password</label>
              </div>
              <div style={{ 
                padding: "16px", background: "var(--bg-color)", border: "1px solid var(--border-color)", 
                borderRadius: "8px", fontFamily: "monospace", fontSize: "18px", wordBreak: "break-all", 
                textAlign: "center", letterSpacing: "1px", color: "var(--text-color)" 
              }}>
                {viewPasswordData.password}
              </div>
            </div>
            
            <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", flexShrink: 0, display: "flex", gap: "12px" }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => handleCopyModalPassword(viewPasswordData.password)} 
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px" }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                {copiedPassword ? "Copied!" : "Copy"}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setViewPasswordData(null)} 
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHORIZATION MODAL */}
      {authModalConfig && (
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
              width: "450px", maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden",
              padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--primary-color)" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Vault Authorization
                </h3>
                <p style={{ margin: "0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Please verify your identity to {authModalConfig.action === 'copied_password' ? 'copy' : 'view'} this credential.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalConfig(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Auth Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)" }}>
              <button
                type="button"
                onClick={() => { setAuthTab("password"); setAuthValue(""); setAuthMsg({type: "", text: ""}); }}
                style={{
                  flex: 1, padding: "12px", background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", transition: "var(--transition)",
                  color: authTab === "password" ? "var(--primary-color)" : "var(--text-muted)",
                  borderBottom: authTab === "password" ? "2px solid var(--primary-color)" : "2px solid transparent"
                }}
              >
                Dashboard Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("otp"); setAuthValue(""); setAuthMsg({type: "", text: ""}); }}
                style={{
                  flex: 1, padding: "12px", background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", transition: "var(--transition)",
                  color: authTab === "otp" ? "var(--primary-color)" : "var(--text-muted)",
                  borderBottom: authTab === "otp" ? "2px solid var(--primary-color)" : "2px solid transparent"
                }}
              >
                Email OTP
              </button>
            </div>

            {authMsg.text && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px", margin: "16px 28px 0", fontSize: "13px", fontWeight: "600", flexShrink: 0,
                backgroundColor: authMsg.type === "success" ? "var(--success-light)" : "var(--danger-light)",
                color: authMsg.type === "success" ? "var(--success-color)" : "var(--danger-color)",
              }}>
                {authMsg.text}
              </div>
            )}

            <form onSubmit={submitAuthAndReveal} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ padding: "20px 28px" }}>
                
                {authTab === "password" ? (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px" }}>Enter your Dashboard Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={authValue} 
                      onChange={(e) => setAuthValue(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                      style={{ fontSize: "13px" }} 
                    />
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span>Enter 6-Digit OTP</span>
                      {!otpSent && (
                        <button type="button" onClick={requestVaultOtp} disabled={authLoading} style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "12px", fontWeight: "600", padding: 0 }}>
                          Send OTP
                        </button>
                      )}
                    </label>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      {authOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (authOtpRefs.current[index] = el)}
                          type="text"
                          value={digit}
                          onChange={(e) => handleAuthOtpChange(e, index)}
                          onKeyDown={(e) => handleAuthOtpKeyDown(e, index)}
                          disabled={!otpSent}
                          className="form-input"
                          style={{
                            width: "45px", height: "50px", textAlign: "center", fontSize: "20px",
                            fontWeight: "bold", padding: 0, borderRadius: "8px", border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-color)", color: "var(--text-color)"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
              
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", flexShrink: 0, display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAuthModalConfig(null)} style={{ flex: 1, justifySelf: "center" }} disabled={authLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, opacity: authLoading ? 0.7 : 1, cursor: authLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={authLoading}>
                  {authLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      Authorizing...
                    </>
                  ) : (authModalConfig.action === 'copied_password' ? "Verify & Copy" : "Verify & View")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
