"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar({ isOpen, toggleSidebar, permissions = {} }) {
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [seoMenuOpen, setSeoMenuOpen] = useState(false);

  // Initialize and auto-open submenus based on pathname
  useEffect(() => {
    if (pathname.startsWith("/seo")) {
      setSeoMenuOpen(true);
    } else {
      const savedSeoOpen = sessionStorage.getItem("sidebar-seo-open");
      if (savedSeoOpen === "true") {
        setSeoMenuOpen(true);
      }
    }
  }, [pathname]);

  const toggleSeoMenu = () => {
    const newState = !seoMenuOpen;
    setSeoMenuOpen(newState);
    sessionStorage.setItem("sidebar-seo-open", newState ? "true" : "false");
  };

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("sidebar-scroll-position");
    if (savedPosition && menuRef.current) {
      const timeoutId = setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.scrollTop = parseFloat(savedPosition);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Save scroll position on scroll event
  const handleScroll = () => {
    if (menuRef.current) {
      sessionStorage.setItem("sidebar-scroll-position", menuRef.current.scrollTop);
    }
  };

  const isSeoActive = pathname.startsWith("/seo");

  // Determine section headers visibility
  const hasContentAccess = permissions.services?.read || permissions.case_studies?.read || permissions.products?.read || permissions.blogs?.read || permissions.seo?.read;
  const hasCrmAccess = permissions.websites?.read || permissions.clients?.read || permissions.design_demos?.read;
  const hasAccountingAccess = permissions.invoices?.read || permissions.expenses?.read || permissions.reports?.read;
  const hasLeadsAccess = permissions.contact_queries?.read || permissions.leads_extractor?.read || permissions.other_queries?.read;
  const hasAdminAccess = permissions.users?.read || permissions.passwords?.read || permissions.backups?.read || permissions.site_health?.read || permissions.settings?.read;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={toggleSidebar} />
      <aside className={`sidebar ${isOpen ? "active" : ""}`}>
        {/* Top Header Section */}
        <div className="sidebar-header">
          <Link href="/" className="logo-area">
            <span className="logo-icon">S</span>
            <span>SEOC Admin</span>
          </Link>
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Middle Menu Items */}
        <ul className="sidebar-menu" ref={menuRef} onScroll={handleScroll}>
          {/* Section 1: Dashboard (No Heading) */}
          <li>
            <Link href="/" className={`menu-item-link ${pathname === "/" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Section 2: Content Management */}
          {hasContentAccess && (
            <>
              <li className="menu-section-header">Content Management</li>
              
              {permissions.services?.read && (
                <li>
                  <Link href="/services" className={`menu-item-link ${pathname === "/services" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>Services</span>
                  </Link>
                </li>
              )}

              {permissions.case_studies?.read && (
                <li>
                  <Link href="/case-studies" className={`menu-item-link ${pathname === "/case-studies" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                      <path d="M22 12A10 10 0 0 0 12 2v10z" />
                    </svg>
                    <span>Case Study</span>
                  </Link>
                </li>
              )}

              {permissions.products?.read && (
                <li>
                  <Link href="/products" className={`menu-item-link ${pathname === "/products" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>Products</span>
                  </Link>
                </li>
              )}

              {permissions.blogs?.read && (
                <li>
                  <Link href="/blogs" className={`menu-item-link ${pathname === "/blogs" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Blogs</span>
                  </Link>
                </li>
              )}

              {/* Collapsible SEO Management */}
              {permissions.seo?.read && (
                <li>
                  <button className={`menu-item-link submenu-parent ${isSeoActive ? "active" : ""}`} onClick={toggleSeoMenu}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span>SEO Management</span>
                    </div>
                    <svg className={`submenu-toggle-icon ${seoMenuOpen ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <ul className={`sidebar-submenu ${seoMenuOpen ? "open" : ""}`}>
                    <li>
                      <Link href="/seo/settings" className={`submenu-item-link ${pathname === "/seo/settings" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                        <span>SEO Settings</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/seo/keywords" className={`submenu-item-link ${pathname === "/seo/keywords" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                        <span>Keywords</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/seo/redirects" className={`submenu-item-link ${pathname === "/seo/redirects" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                        <span>Redirects</span>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}

          {/* Section 3: CRM */}
          {hasCrmAccess && (
            <>
              <li className="menu-section-header">CRM</li>

              {permissions.websites?.read && (
                <li>
                  <Link href="/crm/websites" className={`menu-item-link ${pathname === "/crm/websites" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span>Websites</span>
                  </Link>
                </li>
              )}

              {permissions.clients?.read && (
                <li>
                  <Link href="/crm/clients" className={`menu-item-link ${pathname === "/crm/clients" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Clients</span>
                  </Link>
                </li>
              )}

              {permissions.design_demos?.read && (
                <li>
                  <Link href="/crm/design-demos" className={`menu-item-link ${pathname === "/crm/design-demos" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    <span>Design Demos</span>
                  </Link>
                </li>
              )}
            </>
          )}

          {/* Section 4: Accounting */}
          {hasAccountingAccess && (
            <>
              <li className="menu-section-header">Accounting</li>

              {permissions.invoices?.read && (
                <li>
                  <Link href="/accounting/invoices" className={`menu-item-link ${pathname === "/accounting/invoices" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                      <line x1="12" y1="4" x2="12" y2="20" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    <span>Invoices</span>
                  </Link>
                </li>
              )}

              {permissions.expenses?.read && (
                <li>
                  <Link href="/accounting/expenses" className={`menu-item-link ${pathname === "/accounting/expenses" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="4" />
                      <line x1="8" y1="2" x2="8" y2="4" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Expenses</span>
                  </Link>
                </li>
              )}

              {permissions.reports?.read && (
                <li>
                  <Link href="/accounting/reports" className={`menu-item-link ${pathname === "/accounting/reports" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Reports</span>
                  </Link>
                </li>
              )}
            </>
          )}

          {/* Section 5: Leads Management */}
          {hasLeadsAccess && (
            <>
              <li className="menu-section-header">Leads Management</li>

              {permissions.contact_queries?.read && (
                <li>
                  <Link href="/leads/contact-queries" className={`menu-item-link ${pathname === "/leads/contact-queries" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Contact Queries</span>
                  </Link>
                </li>
              )}

              {permissions.leads_extractor?.read && (
                <li>
                  <Link href="/leads/extractor" className={`menu-item-link ${pathname === "/leads/extractor" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span>Leads Extractor</span>
                  </Link>
                </li>
              )}

              {permissions.other_queries?.read && (
                <li>
                  <Link href="/leads/other-queries" className={`menu-item-link ${pathname === "/leads/other-queries" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Other Queries</span>
                  </Link>
                </li>
              )}
            </>
          )}

          {/* Section 6: Administration */}
          {hasAdminAccess && (
            <>
              <li className="menu-section-header">Administration</li>

              {permissions.users?.read && (
                <li>
                  <Link href="/admin/users" className={`menu-item-link ${pathname === "/admin/users" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="17" y1="11" x2="23" y2="11" />
                    </svg>
                    <span>User Management</span>
                  </Link>
                </li>
              )}

              {permissions.passwords?.read && (
                <li>
                  <Link href="/admin/password" className={`menu-item-link ${pathname === "/admin/password" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Password Manager</span>
                  </Link>
                </li>
              )}

              {permissions.backups?.read && (
                <li>
                  <Link href="/admin/backups" className={`menu-item-link ${pathname === "/admin/backups" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                    </svg>
                    <span>Database Backups</span>
                  </Link>
                </li>
              )}

              {permissions.site_health?.read && (
                <li>
                  <Link href="/admin/health" className={`menu-item-link ${pathname === "/admin/health" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span>Site Health</span>
                  </Link>
                </li>
              )}

              {permissions.settings?.read && (
                <li>
                  <Link href="/settings" className={`menu-item-link ${pathname === "/settings" ? "active" : ""}`} onClick={() => { if (isOpen) toggleSidebar(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Settings</span>
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Bottom Visit Website Link */}
        <div className="sidebar-footer">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="visit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Visit Website</span>
          </a>
        </div>
      </aside>
    </>
  );
}
