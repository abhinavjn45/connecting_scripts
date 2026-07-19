"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DatabaseBackupsPage() {
  const router = useRouter();

  // State
  const [schedules, setSchedules] = useState([]);
  const [backups, setBackups] = useState([]);
  
  // Pagination State for Backups
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingBackups, setLoadingBackups] = useState(true);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [manualBackupLoading, setManualBackupLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatusMsg, setBackupStatusMsg] = useState("");
  const [backupError, setBackupError] = useState(null);

  const [selectedBackups, setSelectedBackups] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [crudPermissions, setCrudPermissions] = useState({ read: false, create: false, update: false, delete: false });
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("cs_rbac_role");
    setUserRole(role);
    
    const stored = localStorage.getItem("cs_rbac_permissions");
    if (stored) {
      try {
        const perms = JSON.parse(stored);
        if (perms.backups) {
          setCrudPermissions(perms.backups);
        }
      } catch (err) {}
    }
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/status`, { credentials: "include" });
        const data = await res.json();
        if (data.isBackingUp) {
          listenToBackupProgress();
        }
      } catch (err) {}
    };

    fetchSchedules();
    checkStatus();
  }, [router]);

  useEffect(() => {
    fetchBackups();
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setPage(1);
  };

  const renderSortIndicator = (column) => {
    if (sortBy !== column) return <span style={{ color: "var(--border-color)", marginLeft: "4px" }}>↕</span>;
    return <span style={{ color: "var(--primary-color)", marginLeft: "4px" }}>{sortOrder === "ASC" ? "↑" : "↓"}</span>;
  };

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/schedules`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error("Failed to fetch schedules");
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const params = new URLSearchParams({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/history?${params.toString()}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch backups");
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError("");
    if (!scheduleTime) {
      setError("Please select a time.");
      return;
    }

    try {
      setModalLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedule_time: scheduleTime })
      });
      const data = await res.json();
      
      if (data.success) {
        setShowScheduleModal(false);
        setScheduleTime("");
        fetchSchedules();
      } else {
        setError(data.message || "Failed to add schedule.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleSchedule = async (id, currentStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      } else {
        alert(data.message || "Failed to update schedule status.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/schedules/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      } else {
        alert(data.message || "Failed to delete schedule.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const listenToBackupProgress = () => {
    setShowProgressModal(true);
    setManualBackupLoading(true);
    setBackupError(null);
    setBackupProgress(0);
    setBackupStatusMsg("Connecting to server...");

    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/progress`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBackupProgress(data.progress);
      setBackupStatusMsg(data.message);
      
      if (data.error) {
        setBackupError(data.error);
        eventSource.close();
        setManualBackupLoading(false);
      } else if (!data.isBackingUp && data.progress === 100) {
        eventSource.close();
        setTimeout(() => {
          setShowProgressModal(false);
          setManualBackupLoading(false);
          fetchBackups();
        }, 2000);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };
  };

  const handleManualBackup = async () => {
    setShowProgressModal(true);
    setBackupError(null);
    setBackupProgress(0);
    setBackupStatusMsg("Starting manual backup...");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/manual`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        listenToBackupProgress();
      } else {
        setBackupError(data.message || "Failed to start manual backup.");
        setManualBackupLoading(false);
      }
    } catch (err) {
      setBackupError("Network error starting backup.");
      setManualBackupLoading(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBackups(backups.map(b => b.id));
    } else {
      setSelectedBackups([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedBackups.includes(id)) {
      setSelectedBackups(selectedBackups.filter(bId => bId !== id));
    } else {
      setSelectedBackups([...selectedBackups, id]);
    }
  };

  const handleBulkDelete = async (idsToDelete = selectedBackups) => {
    if (!idsToDelete || idsToDelete.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} backup(s)? This action cannot be undone.`)) return;

    try {
      setBulkDeleteLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/backups/history/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: idsToDelete })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBackups([]);
        fetchBackups();
      } else {
        alert(data.message || "Failed to delete backups.");
      }
    } catch (err) {
      alert("Network error deleting backups.");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <>
      <div 
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "700" }}>Database Backups</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Schedule automated cloud storage updates and manage your database snapshots.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {crudPermissions.create && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowProgressModal(true)}
              disabled={manualBackupLoading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {manualBackupLoading ? (
                <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              )}
              {manualBackupLoading ? "Backing Up..." : "Manual Backup Now"}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", flexDirection: "row", flexWrap: "wrap", alignItems: "stretch" }}>
        {/* Column 3: Schedules */}
        {crudPermissions.create && (
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>Automated Schedules</h3>
                <button 
                  className="btn btn-sm btn-primary" 
                  onClick={() => setShowScheduleModal(true)}
                  style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Schedule
                </button>
              </div>

              {loadingSchedules ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Loading schedules...
                </div>
              ) : schedules.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "12px", opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <p style={{ margin: 0 }}>No automated backups scheduled.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
                  {schedules.map(schedule => (
                    <div key={schedule.id} style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                          {formatTime(schedule.schedule_time)}
                          {!schedule.is_active && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "10px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)" }}>Paused</span>}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Daily • Added by {schedule.first_name}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {crudPermissions.update && (
                          <label className="switch" style={{ margin: 0 }}>
                            <input 
                              type="checkbox" 
                              checked={schedule.is_active === 1 || schedule.is_active === true}
                              onChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                            />
                            <span className="slider round"></span>
                          </label>
                        )}
                        {crudPermissions.delete && (
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            style={{ background: "none", border: "none", padding: "6px", cursor: "pointer", color: "var(--danger-color)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete Schedule"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Column 9: History */}
        <div style={{ flex: crudPermissions.create ? "3 1 600px" : "1 1 100%", minWidth: 0 }}>
          <div className="card" style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>Backup History (Last 30 Days)</h3>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", minWidth: "250px" }}>
                  <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search backups..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "32px", fontSize: "13px", width: "100%", padding: "6px 12px 6px 32px" }}
                  />
                </div>

                {crudPermissions.delete && selectedBackups.length > 0 && (
                  <button 
                    onClick={() => handleBulkDelete()} 
                    className="btn btn-outline" 
                    style={{ borderColor: "var(--danger-color)", color: "var(--danger-color)", padding: "4px 12px", fontSize: "12px" }}
                    disabled={bulkDeleteLoading}
                  >
                    {bulkDeleteLoading ? "Deleting..." : `Delete Selected (${selectedBackups.length})`}
                  </button>
                )}
                <button onClick={fetchBackups} className="btn btn-outline btn-sm" disabled={loadingBackups}>
                  Refresh
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowX: "auto" }}>
              {loadingBackups ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                  <div style={{ width: "36px", height: "36px", border: "3px solid rgba(77,68,197,0.2)", borderTop: "3px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                  Fetching history from secure cloud storage...
                </div>
              ) : backups.length === 0 ? (
                <div style={{ padding: "60px 40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "16px", opacity: 0.3 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p style={{ margin: 0 }}>No backups match your current filters.</p>
                </div>
              ) : (
                <>
                  <table className="custom-table" style={{ minWidth: "800px" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "40px", paddingLeft: "24px" }}>
                          <input 
                            type="checkbox" 
                            checked={selectedBackups.length === backups.length && backups.length > 0} 
                            onChange={handleToggleSelectAll} 
                          />
                        </th>
                        <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('name')}>Backup File {renderSortIndicator('name')}</th>
                        <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('size')}>Size {renderSortIndicator('size')}</th>
                        <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort('created_at')}>Generated At {renderSortIndicator('created_at')}</th>
                        <th style={{ textAlign: "right", paddingRight: "24px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id} style={{ backgroundColor: selectedBackups.includes(backup.id) ? "var(--surface-hover)" : "transparent" }}>
                          <td style={{ paddingLeft: "24px" }}>
                            <input 
                              type="checkbox" 
                              checked={selectedBackups.includes(backup.id)} 
                              onChange={() => handleToggleSelect(backup.id)} 
                            />
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ padding: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary-color)", borderRadius: "8px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                              </div>
                              <div>
                                <strong style={{ fontSize: "13px", display: "block", color: "var(--text-color)" }}>{backup.name}</strong>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>SQL Database Dump</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>{formatBytes(backup.size)}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "13px" }}>
                              {new Date(backup.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                              {crudPermissions.read && (
                                <a 
                                  href={backup.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-outline"
                                  style={{ padding: "6px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                  Download
                                </a>
                              )}
                              {crudPermissions.delete && (
                                <button 
                                  onClick={() => handleBulkDelete([backup.id])}
                                  className="btn btn-outline"
                                  style={{ padding: "6px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", borderColor: "var(--danger-color)", color: "var(--danger-color)" }}
                                  title="Delete Backup"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", backgroundColor: "#fdfdfd" }}>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Showing <strong>{(page - 1) * limit + 1}</strong> to <strong>{Math.min(page * limit, totalCount)}</strong> of <strong>{totalCount}</strong> backups
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                        Rows per page:
                        <select 
                          value={limit} 
                          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none", cursor: "pointer", backgroundColor: "#fff" }}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button 
                          type="button" 
                          disabled={page === 1}
                          onClick={() => setPage(p => p - 1)}
                          style={{ 
                            padding: "6px 12px", 
                            backgroundColor: page === 1 ? "var(--border-color)" : "#fff",
                            color: page === 1 ? "var(--text-muted)" : "var(--text-color)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            cursor: page === 1 ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "var(--transition)"
                          }}
                        >
                          Previous
                        </button>
                        <button 
                          type="button" 
                          disabled={page * limit >= totalCount}
                          onClick={() => setPage(p => p + 1)}
                          style={{ 
                            padding: "6px 12px", 
                            backgroundColor: page * limit >= totalCount ? "var(--border-color)" : "#fff",
                            color: page * limit >= totalCount ? "var(--text-muted)" : "var(--text-color)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            cursor: page * limit >= totalCount ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "var(--transition)"
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
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
              width: "420px", padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Schedule Automated Backup</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule}>
              <div style={{ padding: "24px 28px" }}>
                {error && (
                  <div style={{ padding: "12px 16px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
                    {error}
                  </div>
                )}
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "13px" }}>Daily Backup Time (IST)</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={scheduleTime} 
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    style={{ fontSize: "15px" }}
                  />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", margin: "8px 0 0 0" }}>
                    The database backup will run automatically every day at this specified time.
                  </p>
                </div>
              </div>
              
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", display: "flex", gap: "12px", borderRadius: "0 0 16px 16px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)} style={{ flex: 1 }} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center" }} disabled={modalLoading}>
                  {modalLoading ? "Scheduling..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup Progress Modal */}
      {showProgressModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8,17,32,0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out",
            pointerEvents: "auto"
          }}
        >
          <div
            className="card"
            style={{
              width: "500px", padding: 0, borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column", position: "relative"
            }}
          >
            {/* Overlay to block closing if backup is actively running */}
            {manualBackupLoading && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} />}
            <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Manual Database Backup</h3>
              {!manualBackupLoading && (
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "30px 20px" }}>
              {!manualBackupLoading && backupProgress === 0 && !backupError ? (
                <>
                  <p style={{ marginBottom: "24px", color: "var(--text-color)" }}>
                    Are you sure you want to start a manual backup now? This process might take a few minutes depending on database size.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProgressModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleManualBackup}>Confirm Backup</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600" }}>
                    <span>Progress</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", backgroundColor: "var(--surface-hover)", borderRadius: "6px", overflow: "hidden", marginBottom: "20px" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${backupProgress}%`, 
                        backgroundColor: backupError ? "var(--danger-color)" : "var(--primary-color)",
                        transition: "width 0.5s ease-out" 
                      }} 
                    />
                  </div>
                  <p style={{ color: backupError ? "var(--danger-color)" : "var(--text-muted)", fontSize: "14px", minHeight: "20px", fontWeight: "500" }}>
                    {backupError || backupStatusMsg}
                  </p>
                  {backupError && (
                    <div style={{ marginTop: "24px" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowProgressModal(false)}>Close</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border-color);
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
        }
        input:checked + .slider {
          background-color: var(--primary-color);
        }
        input:checked + .slider:before {
          transform: translateX(16px);
        }
        .slider.round {
          border-radius: 20px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </>
  );
}
