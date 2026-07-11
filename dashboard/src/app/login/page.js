"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    // Simulate successful login and redirect to Dashboard Overview
    router.push("/");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Password reset instructions have been sent to your email (simulated).");
  };

  return (
    <div className="login-container">
      {/* Left Panel: Minimal Premium Branding Layout */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <span className="login-logo-icon">S</span>
            <span>SEOC Admin</span>
          </div>
          
          <div style={{ marginTop: "100px" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--primary-color)", fontWeight: "700", display: "block", marginBottom: "16px" }}>
              Agency Workspace
            </span>
            <h1 className="login-left-title" style={{ fontSize: "42px", fontWeight: "800", lineHeight: "1.15", margin: 0 }}>
              Unified Control.
              <br />
              Scale Operations.
            </h1>
            <p className="login-left-desc" style={{ fontSize: "15px", color: "#9ca3af", marginTop: "24px", lineHeight: "1.6", maxWidth: "420px" }}>
              A single configuration dashboard to orchestrate campaigns, monitor live performance metrics, manage client databases, and streamline billing.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Credentials Form */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Enter your administrator credentials to sign in</p>
          </div>

          {error && (
            <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="admin@seocagency.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  style={{ paddingRight: "44px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="remember-me">
                <input type="checkbox" id="remember" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
