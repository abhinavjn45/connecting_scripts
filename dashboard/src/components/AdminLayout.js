"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useTheme } from "./ThemeProvider";

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profileRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication State
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Logged in user info state
  const [user, setUser] = useState({
    firstName: "Administrator",
    lastName: "User",
    email: "admin@seocagency.com",
    role: "Super Admin"
  });

  // RBAC permissions state representing the CRUD matrix
  const [permissions, setPermissions] = useState(() => {
    const defaultPerms = {};
    const modules = [
      'services', 'case_studies', 'products', 'blogs', 'seo',
      'websites', 'clients', 'design_demos',
      'invoices', 'expenses', 'reports',
      'contact_queries', 'leads_extractor', 'other_queries',
      'users', 'passwords', 'backups', 'site_health', 'settings'
    ];
    modules.forEach(m => {
      defaultPerms[m] = { read: true, create: true, update: true, delete: true };
    });
    return defaultPerms;
  });

  useEffect(() => {
    const verifyAndLoad = async () => {
      const loggedIn = localStorage.getItem("seoc_is_logged_in");

      // Step 1: Fast local check — if they didn't even pass login screen, redirect
      if (loggedIn !== "true") {
        router.replace("/login");
        return;
      }

      // Step 2: Verify token with backend — this is the real security gate
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          credentials: "include"
        });

        if (res.status === 401 || res.status === 403) {
          // Token invalid, expired, or revoked — force logout
          localStorage.removeItem("seoc_is_logged_in");
          localStorage.removeItem("seoc_rbac_role");
          localStorage.removeItem("seoc_rbac_permissions");
          router.replace("/login?reason=session_expired");
          return;
        }

        if (!res.ok) {
          // Backend is down or returned an unexpected error
          // Still force logout — do not silently allow dashboard access
          localStorage.removeItem("seoc_is_logged_in");
          router.replace("/login?reason=server_unavailable");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setPermissions(data.permissions || {});

          // Keep local cache in sync
          localStorage.setItem("seoc_rbac_role", data.user.role);
          localStorage.setItem("seoc_rbac_permissions", JSON.stringify(data.permissions));
        }
      } catch {
        // Network error (backend completely unreachable) — force logout
        localStorage.removeItem("seoc_is_logged_in");
        router.replace("/login?reason=server_unavailable");
        return;
      }

      setCheckingAuth(false);
    };

    verifyAndLoad();

    // Re-verify whenever RBAC or storage changes
    const handleRbacUpdate = () => verifyAndLoad();
    window.addEventListener("rbac-update", handleRbacUpdate);
    window.addEventListener("storage", handleRbacUpdate);

    return () => {
      window.removeEventListener("rbac-update", handleRbacUpdate);
      window.removeEventListener("storage", handleRbacUpdate);
    };
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check path authorization by checking CRUD read permission
  const checkHasPermission = () => {
    if (pathname === "/") return true;
    if (pathname.startsWith("/admin/profile")) return true; // Profile settings are always viewable

    if (pathname.startsWith("/services")) return permissions.services?.read;
    if (pathname.startsWith("/case-studies")) return permissions.case_studies?.read;
    if (pathname.startsWith("/products")) return permissions.products?.read;
    if (pathname.startsWith("/blogs")) return permissions.blogs?.read;
    if (pathname.startsWith("/seo")) return permissions.seo?.read;

    if (pathname.startsWith("/crm/websites")) return permissions.websites?.read;
    if (pathname.startsWith("/crm/clients")) return permissions.clients?.read;
    if (pathname.startsWith("/crm/design-demos")) return permissions.design_demos?.read;

    if (pathname.startsWith("/accounting/invoices")) return permissions.invoices?.read;
    if (pathname.startsWith("/accounting/expenses")) return permissions.expenses?.read;
    if (pathname.startsWith("/accounting/reports")) return permissions.reports?.read;

    if (pathname.startsWith("/leads/contact-queries")) return permissions.contact_queries?.read;
    if (pathname.startsWith("/leads/extractor")) return permissions.leads_extractor?.read;
    if (pathname.startsWith("/leads/other-queries")) return permissions.other_queries?.read;

    if (pathname.startsWith("/admin/users")) return permissions.users?.read;
    if (pathname.startsWith("/admin/password")) return permissions.passwords?.read;
    if (pathname.startsWith("/admin/backups")) return permissions.backups?.read;
    if (pathname.startsWith("/admin/health")) return permissions.site_health?.read;
    if (pathname.startsWith("/settings")) return permissions.settings?.read;

    return true;
  };

  const isAuthorized = checkHasPermission();

  // If redirecting, render a premium placeholder loading view to prevent layout shifts/content flashing
  if (checkingAuth) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#081120", color: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "48px", 
            height: "48px", 
            border: "3px solid #1b254b", 
            borderTopColor: "#4d44c5", 
            borderRadius: "50%", 
            animation: "spin 1s infinite linear", 
            margin: "0 auto 16px auto" 
          }}></div>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#9ca3af" }}>Securing workspace connection...</span>
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} permissions={permissions} />
      <div className="main-wrapper">
        <header className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            {/* Desktop Sidebar Toggle Button */}
            <button className="desktop-sidebar-toggle-btn" onClick={toggleCollapse} aria-label="Toggle Sidebar">
              {sidebarCollapsed ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3z" fill="var(--primary-color)" />
                </svg>
              )}
            </button>
            
            <div className="page-title">
              <h1>{title || "Dashboard"}</h1>
            </div>
          </div>

          <div className="top-bar-actions">
            {/* Theme Toggle Button */}
            <button className="header-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown Component */}
            <div className="user-profile-wrapper" ref={profileRef}>
              <button className="user-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Avatar" 
                    className="user-avatar"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="user-avatar">{user.firstName ? user.firstName[0].toUpperCase() : 'A'}</div>
                )}
                <div className="user-info-text">
                  <span className="fullname">{user.firstName} {user.lastName}</span>
                  <span className="role">{user.role}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Interactive Profile Dropdown Menu */}
              <div className={`profile-dropdown ${profileOpen ? "show" : ""}`}>
                <div className="dropdown-user-header">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p>{user.email}</p>
                </div>
                <Link href="/admin/profile" className="dropdown-item" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>My Profile</span>
                </Link>
                <Link href="/admin/profile?tab=security" className="dropdown-item" onClick={() => setProfileOpen(false)} style={{ textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Account Settings</span>
                </Link>
                <button 
                  className="dropdown-item logout" 
                  onClick={async () => {
                    setProfileOpen(false);
                    try {
                      await fetch("http://localhost:5000/api/auth/logout", {
                        method: "POST",
                        credentials: "include"
                      });
                    } catch (e) {
                      console.error("Logout API error:", e);
                    }
                    localStorage.removeItem("seoc_is_logged_in");
                    router.push("/login"); 
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body">
          {isAuthorized ? children : (
            <div className="card" style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center", padding: "40px 32px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "var(--text-color)" }}>Access Denied</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
                You do not have the required permissions to access this section of the SEOC Administration Workspace. Please contact your system administrator to request access.
              </p>
              <Link href="/" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                Return to Dashboard
              </Link>
            </div>
          )}
        </main>

        {/* Layout Footer */}
        <footer className="admin-footer">
          <div>
            <span>© 2026 <strong>SEOC</strong>. All Rights Reserved.</span>
          </div>
          <div>
            <span>Developed by <strong>Connecting Scripts</strong></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
