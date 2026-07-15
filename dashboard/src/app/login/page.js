"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  
  // Step: "credentials" | "2fa_otp"
  const [loginStep, setLoginStep] = useState("credentials");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const searchParams = useSearchParams();

  // Handle Resend Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Show contextual message when force-redirected from dashboard
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      setInfo("Your session has expired or is no longer valid. Please sign in again.");
    } else if (reason === "server_unavailable") {
      setInfo("The server is currently unavailable. Your session was cleared for security. Please try again shortly.");
    }
  }, [searchParams]);
  // OTP Ref states for 6 digits
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Auto-focus first box on step transition
  useEffect(() => {
    if (loginStep === "2fa_otp") {
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    }
  }, [loginStep]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Invalid credentials. Hint: Use admin@connectingscripts.co.in / admin123");
        return;
      }

      if (data.requires2fa) {
        setLoginStep("2fa_otp");
        setInfo("An OTP has been sent to your registered email.");
        setError("");
      } else {
        localStorage.setItem("cs_is_logged_in", "true");
        localStorage.setItem("cs_rbac_role", data.user?.role || "Super Admin");
        
        // Dispatch local events to sync sidebar immediately
        window.dispatchEvent(new Event("rbac-update"));
        router.push("/");
      }
    } catch (err) {
      setError("Unable to connect to the backend server. Please verify the server is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP digit handling
  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp_code: otpCode })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid verification code.");
        return;
      }

      localStorage.setItem("cs_is_logged_in", "true");
      localStorage.setItem("cs_rbac_role", data.user?.role || "Super Admin");
      
      window.dispatchEvent(new Event("rbac-update"));
      router.push("/");
    } catch (err) {
      setError("Unable to connect to the backend server. Please verify the server is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    setInfo("Resending OTP...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/resend-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setInfo(data.message || "OTP sent successfully.");
        const nextAttempts = resendAttempts + 1;
        setResendAttempts(nextAttempts);
        if (nextAttempts === 1) setResendTimer(30);
        else if (nextAttempts === 2) setResendTimer(60);
        else setResendTimer(120);
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel: Minimal Premium Branding Layout */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <span className="login-logo-icon">S</span>
            <span>Connecting Scripts Admin</span>
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
          
          {/* Step 1: Standard Credentials */}
          {loginStep === "credentials" && (
            <>
              <div className="login-header">
                <h2>Welcome Back</h2>
                <p>Sign in with your company email and password</p>
              </div>

              {info && (
                <div style={{ padding: "12px 14px", backgroundColor: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "500", lineHeight: "1.5" }}>
                  ⚠ {info}
                </div>
              )}

              {error && (
                <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Company Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="yourname@company.com"
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
                        display: "flex",
                        alignItems: "center",
                        padding: 0
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <label className="remember-me">
                    <input type="checkbox" disabled={isLoading || isRedirecting} />
                    <span>Remember Me</span>
                  </label>
                  <a href="/forgot-password" onClick={(e) => {
                    e.preventDefault();
                    if (isLoading || isRedirecting) return;
                    setIsRedirecting(true);
                    router.push("/forgot-password");
                  }} style={{ color: "var(--primary-color)", fontSize: "13px", fontWeight: "600", textDecoration: "none", pointerEvents: (isLoading || isRedirecting) ? "none" : "auto", opacity: (isLoading || isRedirecting) ? 0.5 : 1, cursor: (isLoading || isRedirecting) ? "not-allowed" : "pointer" }}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", opacity: (isLoading || isRedirecting) ? 0.7 : 1, cursor: (isLoading || isRedirecting) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={isLoading || isRedirecting}>
                  {isLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      Signing In...
                    </>
                  ) : isRedirecting ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      Redirecting...
                    </>
                  ) : "Sign In"}
                </button>
              </form>
            </>
          )}

          {/* Step 2: 2FA Verification */}
          {loginStep === "2fa_otp" && (
            <>
              <div className="login-header">
                <h2>Security Code Verification</h2>
                <p>A multi-factor authorization challenge is active for this account.</p>
              </div>

              {info && (
                <div style={{ padding: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {info}
                </div>
              )}

              {error && (
                <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleOtpSubmit}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", margin: "28px 0" }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      style={{
                        width: "48px",
                        height: "54px",
                        fontSize: "20px",
                        fontWeight: "700",
                        textAlign: "center",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface-color)",
                        color: "var(--text-color)"
                      }}
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", marginBottom: "16px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                      Verifying OTP...
                    </>
                  ) : "Verify & Log In"}
                </button>

                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || resendTimer > 0}
                    style={{
                      background: "none",
                      border: "none",
                      color: (isResending || resendTimer > 0) ? "var(--text-muted)" : "var(--primary-color)",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: (isResending || resendTimer > 0) ? "not-allowed" : "pointer",
                      textDecoration: (isResending || resendTimer > 0) ? "none" : "underline"
                    }}
                  >
                    {isResending ? "Resending OTP..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive code? Resend OTP"}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setLoginStep("credentials");
                    setError("");
                    setInfo("");
                    setOtp(["", "", "", "", "", ""]);
                    setResendTimer(0);
                    setResendAttempts(0);
                  }}
                  style={{ width: "100%", padding: "14px" }}
                >
                  Back to Sign In
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--bg-color)" }}><div style={{ width: "40px", height: "40px", border: "3px solid rgba(77,68,197,0.2)", borderTop: "3px solid var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
