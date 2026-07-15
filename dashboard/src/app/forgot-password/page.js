"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle Resend Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const otpInputsRef = useRef([]);

  // Auto-focus first OTP box when arriving on Step 2
  useEffect(() => {
    if (step === 2 && otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  }, [step]);

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to process request.");
        return;
      }
      
      setSuccess(data.message || "If an account exists, an OTP has been sent.");
      setStep(2);
      setResendTimer(30); // 30s before they can resend
    } catch (err) {
      setError("Unable to connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle individual digit input updates
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Allow numbers only
    
    const newOtp = [...otp];
    newOtp[index] = val ? val.slice(-1) : "";
    setOtp(newOtp);
    setError("");

    // Auto-focus next input field
    if (val && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Navigate backwards on Backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputsRef.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join("");
    if (enteredCode.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredCode })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Invalid verification code.");
        return;
      }
      
      setSuccess("");
      setStep(3);
    } catch (err) {
      setError("Unable to connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle setting new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const enteredCode = otp.join("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredCode, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }
      
      setSuccess("Your password has been reset successfully. You can now log in.");
      setStep(4);
    } catch (err) {
      setError("Unable to connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setIsResending(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(data.message || "OTP resent successfully.");
        setResendTimer(60);
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
      {/* Left Panel: Matches Login Aesthetics */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <span className="login-logo-icon">S</span>
            <span>Connecting Scripts Admin</span>
          </div>
          
          <div style={{ marginTop: "100px" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--primary-color)", fontWeight: "700", display: "block", marginBottom: "16px" }}>
              Password Recovery
            </span>
            <h1 className="login-left-title" style={{ fontSize: "42px", fontWeight: "800", lineHeight: "1.15", margin: 0 }}>
              Secure Recovery.
              <br />
              Protect Account.
            </h1>
            <p className="login-left-desc" style={{ fontSize: "15px", color: "#9ca3af", marginTop: "24px", lineHeight: "1.6", maxWidth: "420px" }}>
              Enter your verified email, check your inbox for the 6-digit confirmation code, and instantly restore access to your agency operations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Interactive Step Forms */}
      <div className="login-right">
        <div className="login-box">
          
          {step === 1 && (
            <div>
              <div className="login-header">
                <h2>Forgot Password?</h2>
                <p>No worries, enter your email below to receive an OTP</p>
              </div>

              {error && (
                <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="admin@connectingscripts.co.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary login-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
                  {isLoading ? "Sending..." : "Send OTP Code"}
                </button>

                <Link href="/login" className="btn btn-secondary login-btn" style={{ textDecoration: "none", marginTop: "12px" }}>
                  Back to Login
                </Link>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="login-header">
                <h2>Verify OTP</h2>
                <p style={{ marginBottom: "8px" }}>We sent a 6-digit verification code to <br /><strong>{email}</strong></p>
                <button 
                  type="button" 
                  onClick={() => {
                    setStep(1);
                    setSuccess("");
                    setError("");
                  }} 
                  style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "13px", fontWeight: "600", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Edit email address
                </button>
              </div>

              {success && (
                <div style={{ padding: "12px", backgroundColor: "var(--primary-light)", color: "var(--primary-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {success}
                </div>
              )}

              {error && (
                <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                {/* 6 Digit Individual Numeric Inputs */}
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="btn btn-primary login-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <Link href="/login" className="btn btn-secondary login-btn" style={{ textDecoration: "none", marginTop: "12px", pointerEvents: isLoading ? "none" : "auto" }}>
                  Back to Login
                </Link>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
                  Didn't receive code?{" "}
                  <a href="#" className="forgot-password-link" onClick={handleResendOtp} style={{ pointerEvents: (isResending || resendTimer > 0) ? "none" : "auto", color: (isResending || resendTimer > 0) ? "var(--text-muted)" : "var(--primary-color)", textDecoration: (isResending || resendTimer > 0) ? "none" : "underline" }}>
                    {isResending ? "Resending..." : resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                  </a>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="login-header">
                <h2>Set New Password</h2>
                <p>Set a strong password to protect your account</p>
              </div>

              {error && (
                <div style={{ padding: "12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password"
                      className="form-input"
                      style={{ paddingRight: "44px" }}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
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
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
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
                  
                  {/* Password Requirements Checklist */}
                  {newPassword && (
                    <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "var(--text-color)" }}>Password must contain:</p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "13px" }}>
                        <li style={{ color: newPassword.length >= 8 ? "var(--success-color)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ display: "inline-block", width: "14px" }}>{newPassword.length >= 8 ? '✓' : '○'}</span> At least 8 characters
                        </li>
                        <li style={{ color: /[A-Z]/.test(newPassword) ? "var(--success-color)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ display: "inline-block", width: "14px" }}>{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span> One uppercase letter
                        </li>
                        <li style={{ color: /[a-z]/.test(newPassword) ? "var(--success-color)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ display: "inline-block", width: "14px" }}>{/[a-z]/.test(newPassword) ? '✓' : '○'}</span> One lowercase letter
                        </li>
                        <li style={{ color: /[0-9]/.test(newPassword) ? "var(--success-color)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ display: "inline-block", width: "14px" }}>{/[0-9]/.test(newPassword) ? '✓' : '○'}</span> One number
                        </li>
                        <li style={{ color: /[^A-Za-z0-9]/.test(newPassword) ? "var(--success-color)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "inline-block", width: "14px" }}>{/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'}</span> One special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      className="form-input"
                      style={{ paddingRight: "44px" }}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
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

                <button type="submit" className="btn btn-primary login-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
                  {isLoading ? "Updating..." : "Update Password"}
                </button>

                <Link href="/login" className="btn btn-secondary login-btn" style={{ textDecoration: "none", marginTop: "12px", pointerEvents: isLoading ? "none" : "auto" }}>
                  Back to Login
                </Link>
              </form>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--success-light)", color: "var(--success-color)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              
              <div className="login-header">
                <h2>Reset Successful</h2>
                <p>Your administrator password has been updated. You can now login with your new credentials.</p>
              </div>

              <Link href="/login" className="btn btn-primary login-btn" style={{ textDecoration: "none" }}>
                Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
