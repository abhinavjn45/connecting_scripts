"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tab Routing
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("details"); // "details" | "security" | "notifications" | "activity"

  useEffect(() => {
    if (tabParam && ["details", "security", "notifications", "activity"].includes(tabParam)) {
      setTimeout(() => setActiveTab(tabParam), 0);
    }
  }, [tabParam]);

  // Tab State Switcher (Updates URL query params without full page reload)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSuccessMsg("");
    router.replace(`/admin/profile?tab=${tabName}`);
  };

  // Profile Details State (live form values)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Profile save modal feedback
  const [profilePhase, setProfilePhase] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [profileMsg, setProfileMsg] = useState("");
  const fileInputRef = useRef(null);
  const previewImgRef = useRef(null);

  // Snapshot of last-saved DB values — used for left card display, change detection, and reset
  const [dbProfile, setDbProfile] = useState(null);

  // Left card read-only fields
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("Others");
  const [designation, setDesignation] = useState("Lead Operator");
  const [joiningDate, setJoiningDate] = useState("");
  const [userStatus, setUserStatus] = useState("Active");

  // Copy email feedbacks
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPersonalEmail, setCopiedPersonalEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(dbProfile?.companyEmail || companyEmail);
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
    }, 1500);
  };

  const handleCopyPersonalEmail = () => {
    navigator.clipboard.writeText(dbProfile?.personalEmail || personalEmail);
    setCopiedPersonalEmail(true);
    setTimeout(() => {
      setCopiedPersonalEmail(false);
    }, 1500);
  };

  // Format date helper
  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return "June 15, 2026";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  // Avatar Modal & Crop States
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Base64 Data URL
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadPhase, setUploadPhase] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [uploadMsg, setUploadMsg] = useState("");

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setSelectedImage(null);
    setUploadPhase("idle");
    setUploadMsg("");
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Security & 2FA State
  const [tfaEnabled, setTfaEnabled] = useState(false);

  const [showTfaConfirmModal, setShowTfaConfirmModal] = useState(false);
  const [showTfaDisableConfirmModal, setShowTfaDisableConfirmModal] = useState(false);
  const [showDisableOtpModal, setShowDisableOtpModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [tfaLoading, setTfaLoading] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [otpPhase, setOtpPhase] = useState("idle");
  const [otpMsg, setOtpMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendDots, setResendDots] = useState("");
  // Disable 2FA OTP state
  const [disableOtpCode, setDisableOtpCode] = useState(["", "", "", "", "", ""]);
  const disableOtpRefs = useRef([]);
  const [disableOtpPhase, setDisableOtpPhase] = useState("idle");
  const [disableOtpMsg, setDisableOtpMsg] = useState("");

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    let interval;
    if (isResending) {
      interval = setInterval(() => {
        setResendDots(prev => prev.length >= 3 ? "" : prev + ".");
      }, 500);
    } else {
      setTimeout(() => setResendDots(""), 0);
    }
    return () => clearInterval(interval);
  }, [isResending]);


  const [sessionList, setSessionList] = useState([
    { id: 1, device: "Windows Desktop", browser: "Chrome 124.0", ip: "192.168.1.45", current: true },
    { id: 2, device: "Apple iPhone 15 Pro", browser: "Safari Mobile", ip: "172.56.21.90", current: false },
    { id: 3, device: "macOS Macbook Air", browser: "Firefox 125.1", ip: "192.168.1.12", current: false }
  ]);

  // Change Password Modal States & Visibility Toggle
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdPhase, setPwdPhase] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [pwdMsg, setPwdMsg] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwdPhase("idle");
    setPwdMsg("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdPhase("error");
      setPwdMsg("All fields are required.");
      return;
    }
    if (currentPassword === newPassword) {
      setPwdPhase("error");
      setPwdMsg("New password cannot be the same as the current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdPhase("error");
      setPwdMsg("New password and confirm password do not match.");
      return;
    }
    
    // Complexity validation: at least 8 chars, uppercase, lowercase, number, special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setPwdPhase("error");
      setPwdMsg("New password must be at least 8 characters long and contain a mix of uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setPwdPhase("loading");
    setPwdMsg("Verifying and changing password...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdPhase("success");
        setPwdMsg("Password updated successfully!");
        
        // Auto close after 1.5 seconds
        setTimeout(() => {
          closePasswordModal();
        }, 1500);
      } else {
        setPwdPhase("error");
        setPwdMsg(data.message || "Failed to update password.");
      }
    } catch (err) {
      setPwdPhase("error");
      setPwdMsg("Unable to connect to the backend server.");
    }
  };

  // Notifications preferences State
  const [emailAlerts, setEmailAlerts] = useState({
    leads: true,
    backups: true,
    uptime: false
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // RBAC System Simulator State
  const [rbacRole, setRbacRole] = useState("Super Admin");
  
  // List of all system modules
  const modulesList = [
    { key: 'services', name: 'Services', category: 'Content Management' },
    { key: 'case_studies', name: 'Case Study', category: 'Content Management' },
    { key: 'products', name: 'Products', category: 'Content Management' },
    { key: 'blogs', name: 'Blogs', category: 'Content Management' },
    { key: 'seo', name: 'SEO Management', category: 'Content Management' },
    { key: 'websites', name: 'Websites', category: 'CRM' },
    { key: 'clients', name: 'Clients', category: 'CRM' },
    { key: 'design_demos', name: 'Design Demos', category: 'CRM' },
    { key: 'invoices', name: 'Invoices', category: 'Accounting' },
    { key: 'expenses', name: 'Expenses', category: 'Accounting' },
    { key: 'reports', name: 'Reports', category: 'Accounting' },
    { key: 'contact_queries', name: 'Contact Queries', category: 'Leads Management' },
    { key: 'leads_extractor', name: 'Leads Extractor', category: 'Leads Management' },
    { key: 'other_queries', name: 'Other Queries', category: 'Leads Management' },
    { key: 'users', name: 'User Management', category: 'Administration' },
    { key: 'passwords', name: 'Password Manager', category: 'Administration' },
    { key: 'backups', name: 'Database Backups', category: 'Administration' },
    { key: 'site_health', name: 'Site Health', category: 'Administration' },
    { key: 'settings', name: 'Settings', category: 'Administration' }
  ];

  const [rbacPermissions, setRbacPermissions] = useState(() => {
    const initial = {};
    modulesList.forEach(m => {
      initial[m.key] = { read: true, create: true, update: true, delete: true };
    });
    return initial;
  });

  // Fetch real profile details and permission matrix from database on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const loggedIn = localStorage.getItem("cs_is_logged_in");
      if (loggedIn !== "true") return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`, {
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const snap = {
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            phone: data.user.phoneNumber || "",
            companyEmail: data.user.companyEmail || "",
            personalEmail: data.user.personalEmail || "",
            bio: data.user.bio || "",
          };

          // Set form fields
          setFirstName(snap.firstName);
          setLastName(snap.lastName);
          setPhone(snap.phone);
          setCompanyEmail(snap.companyEmail);
          setPersonalEmail(snap.personalEmail);
          setBio(snap.bio);

          // Save DB snapshot for left card display, change-detection, and reset
          setDbProfile(snap);

          setTfaEnabled(data.user.twoFactorEnabled || false);
          setRbacRole(data.user.role || "Super Admin");
          setRbacPermissions(data.permissions || {});
          setProfileImage(data.user.profileImage || "");

          setUsername(data.user.username || "");
          setGender(data.user.gender || "Others");
          setDesignation(data.user.designation || "Lead Operator");
          setJoiningDate(data.user.joiningDate || "");
          setUserStatus(data.user.status || "Active");

          // Sync locally for sidebars
          localStorage.setItem("cs_rbac_role", data.user.role);
          localStorage.setItem("cs_rbac_permissions", JSON.stringify(data.permissions));
          localStorage.setItem("cs_2fa_enabled", data.user.twoFactorEnabled ? "true" : "false");
          window.dispatchEvent(new Event("rbac-update"));
        }
      } catch (err) {
        console.error("Failed to load profile from backend database:", err);
      }
    };
    fetchProfile();
  }, []);

  // Generate presets helper
  const getPresetPermissions = (roleName) => {
    const perms = {};
    modulesList.forEach(m => {
      if (roleName === "Super Admin") {
        perms[m.key] = { read: true, create: true, update: true, delete: true };
      } else if (roleName === "Content Editor") {
        const isContent = m.category === 'Content Management';
        perms[m.key] = { 
          read: isContent, 
          create: isContent, 
          update: isContent, 
          delete: isContent 
        };
      } else if (roleName === "CRM Agent") {
        const isCrm = m.category === 'CRM' || m.category === 'Leads Management';
        perms[m.key] = { 
          read: isCrm, 
          create: isCrm, 
          update: isCrm, 
          delete: isCrm 
        };
      } else if (roleName === "Accountant") {
        const isFinance = m.category === 'Accounting';
        perms[m.key] = { 
          read: isFinance, 
          create: isFinance, 
          update: isFinance, 
          delete: isFinance 
        };
      } else {
        perms[m.key] = { read: true, create: false, update: false, delete: false };
      }
    });
    return perms;
  };

  // Sync role and permissions matrix to database in real-time
  const syncPermissionsToDb = async (roleName, perms) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/rbac`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ role: roleName, permissions: perms })
      });
      if (res.ok) {
        localStorage.setItem("cs_rbac_role", roleName);
        localStorage.setItem("cs_rbac_permissions", JSON.stringify(perms));
        window.dispatchEvent(new Event("rbac-update"));
      }
    } catch (err) {
      console.error("Failed to sync permissions to database:", err);
    }
  };

  const handleRoleChange = async (roleName) => {
    setRbacRole(roleName);
    const newPerms = getPresetPermissions(roleName);
    setRbacPermissions(newPerms);
    await syncPermissionsToDb(roleName, newPerms);
    setSuccessMsg(`Switched role to ${roleName}! SQL database matrix updated.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handlePermissionToggle = async (moduleKey, action) => {
    const updatedPerms = {
      ...rbacPermissions,
      [moduleKey]: {
        ...rbacPermissions[moduleKey],
        [action]: !rbacPermissions[moduleKey][action]
      }
    };
    setRbacPermissions(updatedPerms);
    setRbacRole("Custom Privileges");
    await syncPermissionsToDb("Custom Privileges", updatedPerms);
  };

  const recentActivities = [
    { id: 1, action: "Updated SEO keywords metadata", target: "SEO Management", time: "10 mins ago" },
    { id: 2, action: "Extracted 42 fresh business leads", target: "Leads Extractor", time: "1 hour ago" },
    { id: 3, action: "Approved client invoice draft", target: "Invoices (#INV-8402)", time: "4 hours ago" },
    { id: 4, action: "Configured Site Health Widget status metrics", target: "Dashboard Health Monitor", time: "Yesterday" },
    { id: 5, action: "Generated new website portfolio preview", target: "CRM - Design Demos", time: "2 days ago" }
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Detect which editable fields have changed vs last saved DB snapshot
    const changes = {};
    if (dbProfile) {
      if (firstName !== dbProfile.firstName) changes.firstName = firstName;
      if (lastName !== dbProfile.lastName) changes.lastName = lastName;
      if (phone !== dbProfile.phone) changes.phoneNumber = phone;
      if (bio !== dbProfile.bio) changes.bio = bio;
      if (personalEmail !== dbProfile.personalEmail) changes.personalEmail = personalEmail;
    } else {
      changes.firstName = firstName;
      changes.lastName = lastName;
      changes.phoneNumber = phone;
      changes.bio = bio;
      changes.personalEmail = personalEmail;
      changes.companyEmail = companyEmail;
    }

    if (Object.keys(changes).length === 0) {
      setProfilePhase("error");
      setProfileMsg("No changes detected — nothing to save.");
      return;
    }

    setProfilePhase("loading");
    setProfileMsg("Saving profile details to database...");
    setSavingProfile(true);

    try {
      const payload = {
        firstName, lastName, phoneNumber: phone,
        bio, personalEmail, ...changes
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbProfile({ firstName, lastName, phone, companyEmail, personalEmail, bio });
        setProfilePhase("success");
        setProfileMsg("Profile details saved successfully!");
        setTimeout(() => setProfilePhase("idle"), 1800);
      } else {
        setProfilePhase("error");
        setProfileMsg(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setProfilePhase("error");
      setProfileMsg("Unable to connect to the backend server.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset form back to the last saved DB values
  const handleResetForm = () => {
    if (!dbProfile) return;
    setFirstName(dbProfile.firstName);
    setLastName(dbProfile.lastName);
    setPhone(dbProfile.phone);
    setPersonalEmail(dbProfile.personalEmail);
    setBio(dbProfile.bio);
    setSuccessMsg("");
  };

  // True when any editable form field differs from the saved DB snapshot
  const hasUnsavedChanges = dbProfile && (
    firstName !== dbProfile.firstName ||
    lastName !== dbProfile.lastName ||
    phone !== dbProfile.phone ||
    bio !== dbProfile.bio ||
    personalEmail !== dbProfile.personalEmail
  );

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg("");
    
    setTimeout(() => {
      setSavingSettings(false);
      setSuccessMsg("Account preferences updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  
  const handleTfaToggleClick = (val) => {
    if (val) {
      setShowTfaConfirmModal(true);
    } else {
      // Always reset disable OTP state before opening so stale messages don't show
      setDisableOtpMsg("");
      setDisableOtpPhase("idle");
      setDisableOtpCode(["", "", "", "", "", ""]);
      setShowTfaDisableConfirmModal(true);
    }
  };

  // Step 1: Send OTP to initiate 2FA disable
  const requestDisableOtp = async () => {
    setTfaLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/2fa/disable/request`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setShowTfaDisableConfirmModal(false);
        setDisableOtpCode(["", "", "", "", "", ""]);
        setDisableOtpPhase("idle");
        setDisableOtpMsg("");
        setShowDisableOtpModal(true);
      } else {
        setDisableOtpMsg(data.message || "Failed to send confirmation code.");
      }
    } catch (err) {
      console.error(err);
      setDisableOtpMsg("Connection error. Please try again.");
    } finally {
      setTfaLoading(false);
    }
  };

  // Step 2: Verify OTP and confirm 2FA disable
  const verifyDisableOtp = async () => {
    const submitted = disableOtpCode.join("");
    if (submitted.length !== 6) {
      setDisableOtpPhase("error");
      setDisableOtpMsg("Please enter the 6-digit code.");
      return;
    }
    setDisableOtpPhase("loading");
    setDisableOtpMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/2fa/disable/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otpCode: submitted })
      });
      const data = await res.json();
      if (data.success) {
        setDisableOtpPhase("success");
        setDisableOtpMsg("2FA successfully disabled!");
        setTimeout(() => {
          setTfaEnabled(false);
          localStorage.setItem("cs_2fa_enabled", "false");
          setShowDisableOtpModal(false);
        }, 1500);
      } else {
        setDisableOtpPhase("error");
        setDisableOtpMsg(data.message || "Invalid code.");
      }
    } catch (err) {
      setDisableOtpPhase("error");
      setDisableOtpMsg("Connection error. Please try again.");
    }
  };

  const handleDisableOtpChange = (e, index) => {
    const val = e.target.value;
    const newOtp = [...disableOtpCode];
    newOtp[index] = val ? val.slice(-1) : "";
    setDisableOtpCode(newOtp);
    if (val && index < 5 && disableOtpRefs.current[index + 1]) {
      disableOtpRefs.current[index + 1].focus();
    }
  };

  const handleDisableOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!disableOtpCode[index] && index > 0) {
        const newOtp = [...disableOtpCode];
        newOtp[index - 1] = "";
        setDisableOtpCode(newOtp);
        disableOtpRefs.current[index - 1].focus();
      }
    }
  };

  const requestTfaOtp = async (isResend = false) => {
    if (isResend) setIsResending(true);
    else setTfaLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/2fa/request`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if(data.success) {
        setShowTfaConfirmModal(false);
        setShowOtpModal(true);
        setOtpPhase("idle");
        setOtpMsg("");
        setOtpCode(["", "", "", "", "", ""]);
        if (!isResend) {
          setResendAttempts(1);
          setResendTimer(30);
        } else {
          const waitTimes = [30, 60, 120];
          const wait = waitTimes[Math.min(resendAttempts, 2)];
          setResendTimer(wait);
          setResendAttempts(a => a + 1);
        }
      }
    } catch(err) {
      console.error(err);
    }
    if (isResend) setIsResending(false);
    else setTfaLoading(false);
  };

  const verifyTfaOtp = async () => {
    const submittedOtp = otpCode.join("");
    if (submittedOtp.length !== 6) {
      setOtpPhase("error");
      setOtpMsg("Please enter a 6-digit code");
      return;
    }
    setOtpPhase("loading");
    setOtpMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otpCode: submittedOtp })
      });
      const data = await res.json();
      if (data.success) {
        setOtpPhase("success");
        setOtpMsg("2FA successfully enabled!");
        setTimeout(() => {
          setTfaEnabled(true);
          localStorage.setItem("cs_2fa_enabled", "true");
          setShowOtpModal(false);
        }, 1500);
      } else {
        setOtpPhase("error");
        setOtpMsg(data.message || "Invalid OTP");
      }
    } catch(err) {
      setOtpPhase("error");
      setOtpMsg("Connection error");
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    const newOtp = [...otpCode];
    newOtp[index] = val ? val.slice(-1) : "";
    setOtpCode(newOtp);
    if (val && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        const newOtp = [...otpCode];
        newOtp[index - 1] = "";
        setOtpCode(newOtp);
        otpRefs.current[index - 1].focus();
      }
    }
  };

  const handleRevokeSession = (id) => {
    setSessionList(sessionList.filter((s) => s.id !== id));
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("cs_jwt_token");
    localStorage.removeItem("cs_is_logged_in");
    window.location.href = "/login";
  };

  // 1. File Chooser handler inside the Modal
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  // 2. Reposition Drag-to-Pan event listeners
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 3. HTML5 Canvas Square-Cropping and Dedicated User Avatar Cloudinary Upload
  const handleAvatarCropAndUpload = async () => {
    if (!selectedImage || !previewImgRef.current) return;
    
    setUploadPhase("loading");
    setUploadMsg("Cropping and formatting image to square aspect ratio...");
    
    const imgElement = previewImgRef.current;
    const renderedWidth = imgElement.offsetWidth;
    const renderedHeight = imgElement.offsetHeight;

    const img = new Image();
    img.src = selectedImage;
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        // Scale factor from crop box size (260px) to destination canvas size (300px)
        const canvasScale = 300 / 260;
        
        const targetWidth = renderedWidth * zoom * canvasScale;
        const targetHeight = renderedHeight * zoom * canvasScale;
        
        const dx = (150 + offsetX * canvasScale) - (targetWidth / 2);
        const dy = (150 + offsetY * canvasScale) - (targetHeight / 2);

        // Fill background white
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, dx, dy, targetWidth, targetHeight);

        // Extract binary image BLOB
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setUploadPhase("error");
            setUploadMsg("Failed to generate cropped image matrix.");
            return;
          }
          
          setUploadMsg("Uploading avatar to Cloudinary...");

          const formData = new FormData();
          formData.append("file", blob, "avatar.jpg");

          try {
            // Upload to Cloudinary "user_avatars" folder route
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/assets/upload-avatar`, {
              method: "POST",
              credentials: "include",
              body: formData
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              setUploadPhase("error");
              setUploadMsg(data.message || "Failed to upload to Cloudinary.");
              return;
            }

            setUploadMsg("Saving settings in database...");

            // Save avatar URL in DB
            const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile/avatar`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({ avatarUrl: data.url })
            });
            const saveData = await saveRes.json();
            if (saveRes.ok && saveData.success) {
              setProfileImage(data.url);
              setUploadPhase("success");
              setUploadMsg("Avatar updated successfully!");
              
              // Tell AdminLayout to sync top header avatar
              window.dispatchEvent(new Event("rbac-update"));
              
              // Close popup after 1.5 seconds automatically
              setTimeout(() => {
                closeAvatarModal();
              }, 1500);
            } else {
              setUploadPhase("error");
              setUploadMsg(saveData.message || "Failed to update profile image.");
            }
          } catch (err) {
            setUploadPhase("error");
            setUploadMsg("Failed to connect to upload server.");
          }
        }, "image/jpeg", 0.95);
        
      } catch (err) {
        setUploadPhase("error");
        setUploadMsg("Error executing image crop canvas draw.");
      }
    };
  };

  // Count active modules access (read-enabled)
  const activeReadCount = Object.values(rbacPermissions).filter(p => p.read).length;

  // Real-time password complexity evaluation helpers
  const pwdMinLength = newPassword.length >= 8;
  const pwdUppercase = /[A-Z]/.test(newPassword);
  const pwdLowercase = /[a-z]/.test(newPassword);
  const pwdNumber = /\d/.test(newPassword);
  const pwdSpecial = /[^A-Za-z0-9]/.test(newPassword);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
      
      {/* Left Card: Unified Profile Summary */}
      <div className="card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        padding: "20px 24px 0 24px", // Reduced top padding
        position: "sticky",
        top: "102px",
        height: "calc(100vh - 204px)",
        overflow: "hidden"
      }}>
        {/* Top Section: Avatar left, Details right */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          {/* Avatar Container */}
          <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary-color)", fontSize: "28px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--border-color)", flexShrink: 0 }}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Avatar Summary" 
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} 
            />
            ) : (
              <span>{dbProfile?.firstName ? dbProfile.firstName[0].toUpperCase() : 'A'}</span>
            )}
            <button 
              type="button"
              onClick={() => setShowAvatarModal(true)}
              style={{
                position: "absolute",
                bottom: "-4px",
                right: "-4px",
                backgroundColor: "var(--primary-color)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "var(--transition)",
                zIndex: 10
              }}
              title="Change Avatar"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          {/* User Name & Role Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden", textAlign: "left" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {dbProfile ? `${dbProfile.firstName} ${dbProfile.lastName}` : "—"}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500" }}>{rbacRole}</span>
              {/* Gender Badge next to Role */}
              <span className="badge primary" style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize" }}>
                {gender}
              </span>
            </div>
          </div>
        </div>

        {/* Bio description */}
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6", textAlign: "left", margin: "0 0 16px 0" }}>
          {(dbProfile && dbProfile.bio) || "No profile bio written yet."}
        </p>

        <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "0 0 16px 0", flexShrink: 0 }} />

        {/* Details list with larger font size and spacing */}
        <div style={{ 
          textAlign: "left", 
          display: "flex", 
          flexDirection: "column", 
          gap: "18px", 
          overflowY: "auto", 
          flex: 1, 
          paddingRight: "8px", 
          paddingBottom: "20px" // Reduced bottom padding
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Username</span>
            <strong style={{ color: "var(--text-color)", fontSize: "14px" }}>{username}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Company Email</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              style={{
                background: copiedEmail ? "var(--success-light)" : "var(--primary-light)",
                border: "1px solid var(--border-color)",
                color: copiedEmail ? "var(--success-color)" : "var(--primary-color)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "var(--transition)",
                outline: "none"
              }}
            >
              {copiedEmail ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Email
                </>
              )}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Personal Email</span>
            {dbProfile?.personalEmail ? (
              <button
                type="button"
                onClick={handleCopyPersonalEmail}
                style={{
                  background: copiedPersonalEmail ? "var(--success-light)" : "var(--primary-light)",
                  border: "1px solid var(--border-color)",
                  color: copiedPersonalEmail ? "var(--success-color)" : "var(--primary-color)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "var(--transition)",
                  outline: "none"
                }}
              >
                {copiedPersonalEmail ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Email
                  </>
                )}
              </button>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>Not set</span>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Phone</span>
            <a 
              href={`tel:${dbProfile?.phone || ""}`} 
              style={{ 
                color: "var(--primary-color)", 
                fontSize: "14px", 
                fontWeight: "600", 
                textDecoration: "none" 
              }}
              className="hover-underline"
            >
              {dbProfile?.phone || "—"}
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Designation</span>
            <strong style={{ color: "var(--text-color)", fontSize: "14px" }}>{designation}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Joined On</span>
            <strong style={{ color: "var(--text-color)", fontSize: "14px" }}>{formatJoinedDate(joiningDate)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Status</span>
            <span className={`badge ${userStatus.toLowerCase() === 'active' ? 'success' : 'primary'}`} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
              {userStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Right Card: Tabs Configuration Card */}
      <div className="card" style={{ 
        padding: "30px",
        position: "sticky",
        top: "102px",
        height: "calc(100vh - 204px)",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* Tab Headers */}
        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-color)", marginBottom: "28px", flexShrink: 0, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "2px" }}>
          <button 
            type="button"
            onClick={() => handleTabChange("details")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "details" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "details" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Personal Details
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("security")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "security" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "security" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Security & Access
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("notifications")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "notifications" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "notifications" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Notifications Prefs
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("activity")}
            style={{
              padding: "0 4px 12px 4px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "activity" ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === "activity" ? "var(--text-color)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            Activity History
          </button>
        </div>

        {/* Scrollable Content wrapper */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          


          {/* Tab 1: Personal Details Content */}
          {activeTab === "details" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Username
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "400", fontStyle: "italic" }}>(Cannot be changed)</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={username} 
                      readOnly
                      tabIndex={-1}
                      style={{ 
                        paddingRight: "40px",
                        backgroundColor: "var(--bg-color)",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                        userSelect: "none"
                      }} 
                    />
                    <span style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none"
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Company Email
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "400", fontStyle: "italic" }}>(Cannot be changed)</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={companyEmail}
                      readOnly
                      tabIndex={-1}
                      style={{
                        paddingRight: "40px",
                        backgroundColor: "var(--bg-color)",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                        userSelect: "none"
                      }}
                    />
                    <span style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none"
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Personal Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={personalEmail} 
                    onChange={(e) => setPersonalEmail(e.target.value)} 
                    placeholder="e.g. name@personal.com"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Personal Bio</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: bio.length >= 100 ? "var(--danger-color)" : bio.length >= 80 ? "#f59e0b" : "var(--text-muted)",
                    transition: "color 0.2s"
                  }}>
                    {bio.length} / 100
                  </span>
                </label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  value={bio} 
                  onChange={(e) => { if (e.target.value.length <= 100) setBio(e.target.value); }}
                  maxLength={100}
                  style={{ 
                    resize: "none", 
                    minHeight: "90px", 
                    fontFamily: "inherit",
                    borderColor: bio.length >= 100 ? "var(--danger-color)" : bio.length >= 80 ? "#f59e0b" : undefined,
                    transition: "border-color 0.2s"
                  }}
                  required
                />
              </div>


              <div style={{ marginTop: "10px", display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", opacity: (!hasUnsavedChanges && dbProfile) ? 0.5 : 1 }}
                  disabled={savingProfile || (!hasUnsavedChanges && !!dbProfile)}
                >
                  {savingProfile ? (
                    <>
                      <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>

                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      padding: "12px 20px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: "none",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "var(--transition)"
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-3.68" />
                    </svg>
                    Reset
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Tab 2: Security & Access */}
          {activeTab === "security" && (
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <h5 style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Two-Factor Authentication (2FA)</h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: "500px" }}>Protect your administrative panels from unauthorized password cracking by configuring multi-factor tokens.</p>
                </div>
                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    checked={tfaEnabled} 
                    onChange={(e) => handleTfaToggleClick(e.target.checked)} disabled={tfaLoading} 
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <h5 style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Account Password</h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: "500px" }}>Regularly update your password to protect against security audits or leaks.</p>
                </div>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowPasswordModal(true)}
                  style={{ 
                    padding: "10px 20px", 
                    fontSize: "13px", 
                    fontWeight: "600", 
                    backgroundColor: "var(--danger-color)", 
                    color: "#ffffff", 
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "var(--transition)"
                  }}
                >
                  Change Password
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <h5 style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Account Logout</h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", maxWidth: "500px" }}>Securely end your current session and clear local authentication data.</p>
                </div>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowLogoutModal(true)}
                  style={{ 
                    padding: "10px 20px", 
                    fontSize: "13px", 
                    fontWeight: "600", 
                    backgroundColor: "var(--danger-color)", 
                    color: "#ffffff", 
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "var(--transition)"
                  }}
                >
                  Logout Session
                </button>
              </div>

              <div>
                <h5 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Active Device Sessions</h5>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Browser</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionList.map((session) => (
                        <tr key={session.id}>
                          <td><strong>{session.device}</strong></td>
                          <td>{session.browser}</td>
                          <td><code>{session.ip}</code></td>
                          <td>
                            <span className={`badge ${session.current ? "success" : "primary"}`}>
                              {session.current ? "Current" : "Active"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {session.current ? (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Secured</span>
                            ) : (
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)" }}
                                onClick={() => handleRevokeSession(session.id)}
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: "10px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", opacity: savingSettings ? 0.7 : 1, cursor: savingSettings ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                        Saving Settings...
                      </>
                    ) : "Save Configuration"}
                  </button>
              </div>
            </form>
          )}

          {/* Tab 3: Notification Preferences */}
          {activeTab === "notifications" && (
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.leads} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, leads: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>New Contact Leads</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Receive instant email alerts when a user submits a contact form on the main website.</span>
                  </div>
                </label>

                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.backups} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, backups: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>Database Backup Alerts</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Send status reports upon completion of automated database backups.</span>
                  </div>
                </label>

                <label className="remember-me" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts.uptime} 
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, uptime: e.target.checked })} 
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-color)", fontSize: "14px" }}>Uptime & Health Reports</strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Send critical email notifications immediately if server latency drops or site health falls below 95%.</span>
                  </div>
                </label>
              </div>

              <div style={{ marginTop: "10px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", opacity: savingSettings ? 0.7 : 1, cursor: savingSettings ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                        Saving Settings...
                      </>
                    ) : "Save Configuration"}
                  </button>
              </div>
            </form>
          )}

          {/* Tab 5: Activity History */}
          {activeTab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentActivities.map((act) => (
                <div key={act.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-color)" }}>
                  <div>
                    <h5 style={{ fontWeight: "600", fontSize: "14px", margin: "0 0 4px 0", color: "var(--text-color)" }}>{act.action}</h5>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target Area: <strong style={{ color: "var(--text-color)" }}>{act.target}</strong></span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>{act.time}</span>
                </div>
              ))}
            </div>
          )}
          
        </div>

      </div>

      {/* 4. Interactive Profile Image Crop Modal overlay */}
      {showAvatarModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card" style={{
            width: "360px",
            padding: "24px",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "260px",
            justifyContent: "center"
          }}>
            {uploadPhase !== "idle" ? (
              // Phase C: Upload Status Animations (Loading, Success Tick, or Error Cross)
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", textAlign: "center", width: "100%" }}>
                {uploadPhase === "loading" && (
                  <div className="spinner-loader" style={{ width: "60px", height: "60px", border: "4px solid rgba(77, 68, 197, 0.15)", borderTop: "4px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "20px" }}></div>
                )}
                
                {uploadPhase === "success" && (
                  <svg className="animated-tick" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--success-color)", strokeMiterlimit: "10", boxShadow: "inset 0px 0px 0px var(--success-color)", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                    <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--success-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                    <path className="tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ transformOrigin: "50% 50%", strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--success-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                  </svg>
                )}

                {uploadPhase === "error" && (
                  <svg className="animated-cross" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--danger-color)", strokeMiterlimit: "10", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                    <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--danger-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                    <path className="tick-check" fill="none" d="M16 16l20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .4s forwards" }} />
                    <path className="tick-check" fill="none" d="M36 16l-20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                  </svg>
                )}

                <p style={{ margin: "0 0 24px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)", lineHeight: "1.5" }}>{uploadMsg}</p>

                {uploadPhase === "error" && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setUploadPhase("idle");
                      setUploadMsg("");
                    }}
                    style={{ padding: "10px 24px", fontSize: "12px", minWidth: "140px" }}
                  >
                    Go Back & Retry
                  </button>
                )}
              </div>
            ) : (
              // Phase A & B: Setup Workspace
              <>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", width: "100%", textAlign: "center" }}>
                  Update Profile Photo
                </h3>

                {/* Hidden native file input element */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: "none" }} 
                  accept="image/*" 
                />

                {!selectedImage ? (
                  // Phase A: Existing avatar display
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}>
                    <div style={{ width: "160px", height: "160px", borderRadius: "50%", overflow: "hidden", border: "4px solid var(--border-color)", backgroundColor: "var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Current Avatar" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        <span style={{ fontSize: "56px", fontWeight: "800", color: "var(--primary-color)" }}>
                          {firstName ? firstName[0].toUpperCase() : 'A'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={closeAvatarModal}
                        style={{ flex: 1, padding: "12px" }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        style={{ flex: 1, padding: "12px" }}
                      >
                        Edit Avatar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Phase B: Image crop workspace with circular cutout mask
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <div 
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        position: "relative",
                        width: "260px",
                        height: "260px",
                        backgroundColor: "#000",
                        borderRadius: "12px",
                        overflow: "hidden",
                        cursor: isDragging ? "grabbing" : "grab",
                        border: "1px solid var(--border-color)",
                        boxShadow: "inset 0 4px 12px rgba(0,0,0,0.5)"
                      }}
                    >
                      {/* Panned and Zoomed Image */}
                      <img 
                        ref={previewImgRef}
                        src={selectedImage} 
                        alt="Source Crop"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                          transition: isDragging ? "none" : "transform 0.1s ease-out",
                          userSelect: "none",
                          pointerEvents: "none",
                          maxWidth: "none",
                          maxHeight: "none",
                          width: "auto",
                          height: "100%"
                        }}
                      />
                      
                      {/* Circular Cutout Frame Overlay */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "50%",
                        boxShadow: "0 0 0 9999px rgba(8, 17, 32, 0.75)",
                        pointerEvents: "none",
                        border: "2px dashed var(--primary-color)"
                      }}></div>
                    </div>

                    {/* Zoom range controller */}
                    <div style={{ width: "100%", margin: "20px 0 16px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "500" }}>
                        <span>Zoom Level</span>
                        <strong style={{ color: "var(--primary-color)", fontSize: "13px" }}>{Math.round(zoom * 100)}%</strong>
                      </div>
                      <input 
                        type="range" 
                        className="premium-range"
                        min="1.0" 
                        max="3.0" 
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setSelectedImage(null);
                          setZoom(1);
                          setOffsetX(0);
                          setOffsetY(0);
                        }}
                        style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleAvatarCropAndUpload}
                        style={{ flex: 2, padding: "10px", fontSize: "12px" }}
                      >
                        Update Profile Image
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes strokeCircle {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes strokeCheck {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes scaleTick {
              0%, 100% { transform: none; }
              50% { transform: scale3d(1.1, 1.1, 1); }
            }
          `}</style>
        </div>
      )}

      {/* 5. Change Password Modal overlay */}
      {showPasswordModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card" style={{
            width: "360px",
            padding: "24px",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "260px",
            justifyContent: "center"
          }}>
            {pwdPhase !== "idle" ? (
              // Status Phase: Loading, Success Tick, or Error Cross
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", textAlign: "center", width: "100%" }}>
                {pwdPhase === "loading" && (
                  <div className="spinner-loader" style={{ width: "60px", height: "60px", border: "4px solid rgba(77, 68, 197, 0.15)", borderTop: "4px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "20px" }}></div>
                )}
                
                {pwdPhase === "success" && (
                  <svg className="animated-tick" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--success-color)", strokeMiterlimit: "10", boxShadow: "inset 0px 0px 0px var(--success-color)", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                    <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--success-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                    <path className="tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ transformOrigin: "50% 50%", strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--success-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                  </svg>
                )}

                {pwdPhase === "error" && (
                  <svg className="animated-cross" width="70" height="70" viewBox="0 0 52 52" style={{ borderRadius: "50%", display: "block", strokeWidth: "3", stroke: "var(--danger-color)", strokeMiterlimit: "10", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                    <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--danger-color)", fill: "none", animation: "strokeCircle .6s cubic-bezier(0.65, 0, 0.45, 1) forwards" }} />
                    <path className="tick-check" fill="none" d="M16 16l20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .4s forwards" }} />
                    <path className="tick-check" fill="none" d="M36 16l-20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65, 0, 0.45, 1) .6s forwards" }} />
                  </svg>
                )}

                <p style={{ margin: "0 0 24px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)", lineHeight: "1.5" }}>{pwdMsg}</p>

                {pwdPhase === "error" && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setPwdPhase("idle");
                      setPwdMsg("");
                    }}
                    style={{ padding: "10px 24px", fontSize: "12px", minWidth: "140px" }}
                  >
                    Go Back & Retry
                  </button>
                )}
              </div>
            ) : (
              // Form Input Phase
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", textAlign: "center" }}>
                  Change Account Password
                </h3>
                <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  Please enter your credentials to complete updates.
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Current Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      className="form-input" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required 
                      style={{ padding: "10px 40px 10px 14px", fontSize: "13px", width: "100%" }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                        justifyContent: "center",
                        padding: 0
                      }}
                    >
                      {showCurrentPassword ? (
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="form-input" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                      style={{ padding: "10px 40px 10px 14px", fontSize: "13px", width: "100%" }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0
                      }}
                    >
                      {showNewPassword ? (
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
                  {/* Real-time Password Strength Criteria List */}
                  {newPassword && (
                    <div style={{ 
                      fontSize: "11px", 
                      marginTop: "6px", 
                      color: "var(--text-muted)", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "4px",
                      backgroundColor: "rgba(77, 68, 197, 0.05)",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)"
                    }}>
                      <span style={{ fontWeight: "600", color: "var(--text-color)", marginBottom: "2px" }}>Password Requirements:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: pwdMinLength ? "var(--success-color)" : "var(--text-muted)", fontWeight: pwdMinLength ? "600" : "400" }}>
                        <span>{pwdMinLength ? "✓" : "•"}</span> At least 8 characters
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: (pwdUppercase && pwdLowercase) ? "var(--success-color)" : "var(--text-muted)", fontWeight: (pwdUppercase && pwdLowercase) ? "600" : "400" }}>
                        <span>{(pwdUppercase && pwdLowercase) ? "✓" : "•"}</span> Uppercase & lowercase letters
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: pwdNumber ? "var(--success-color)" : "var(--text-muted)", fontWeight: pwdNumber ? "600" : "400" }}>
                        <span>{pwdNumber ? "✓" : "•"}</span> At least one number (0-9)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: pwdSpecial ? "var(--success-color)" : "var(--text-muted)", fontWeight: pwdSpecial ? "600" : "400" }}>
                        <span>{pwdSpecial ? "✓" : "•"}</span> At least one special character
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "12px" }}>Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="form-input" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      style={{ padding: "10px 40px 10px 14px", fontSize: "13px", width: "100%" }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0
                      }}
                    >
                      {showConfirmPassword ? (
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
                  {/* Real-time Match Check Indicator */}
                  {confirmPassword && (
                    <div style={{ 
                      fontSize: "11px", 
                      marginTop: "5px", 
                      color: confirmPassword === newPassword ? "var(--success-color)" : "var(--danger-color)",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {confirmPassword === newPassword ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Passwords match
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Passwords do not match
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "10px", width: "100%" }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closePasswordModal}
                    style={{ flex: 1, padding: "12px", fontSize: "13px" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      padding: "12px", 
                      fontSize: "13px", 
                      fontWeight: "600", 
                      backgroundColor: "var(--danger-color)", 
                      color: "#ffffff", 
                      border: "none", 
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile Save Feedback Modal */}
      {profilePhase !== "idle" && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card" style={{
            width: "340px", padding: "36px 28px",
            backgroundColor: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center"
          }}>
            {profilePhase === "loading" && (
              <div style={{ width: "60px", height: "60px", border: "4px solid rgba(77,68,197,0.15)", borderTop: "4px solid var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "20px" }} />
            )}

            {profilePhase === "success" && (
              <svg width="70" height="70" viewBox="0 0 52 52" style={{ display: "block", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                <circle cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--success-color)", animation: "strokeCircle .6s cubic-bezier(0.65,0,0.45,1) forwards" }} />
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--success-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65,0,0.45,1) .6s forwards" }} />
              </svg>
            )}

            {profilePhase === "error" && (
              <svg width="70" height="70" viewBox="0 0 52 52" style={{ display: "block", animation: "scaleTick .3s ease-in-out both", marginBottom: "20px" }}>
                <circle cx="26" cy="26" r="25" fill="none" style={{ strokeDasharray: "166", strokeDashoffset: "166", strokeWidth: "3", strokeMiterlimit: "10", stroke: "var(--danger-color)", animation: "strokeCircle .6s cubic-bezier(0.65,0,0.45,1) forwards" }} />
                <path fill="none" d="M16 16l20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65,0,0.45,1) .4s forwards" }} />
                <path fill="none" d="M36 16l-20 20" style={{ strokeDasharray: "48", strokeDashoffset: "48", stroke: "var(--danger-color)", strokeWidth: "3", animation: "strokeCheck .3s cubic-bezier(0.65,0,0.45,1) .6s forwards" }} />
              </svg>
            )}

            <p style={{ margin: "0 0 24px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)", lineHeight: "1.5" }}>
              {profileMsg}
            </p>

            {profilePhase === "error" && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setProfilePhase("idle"); setProfileMsg(""); }}
                style={{ padding: "10px 28px", fontSize: "13px" }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      
        {/* 2FA Confirmation Modal */}
        {showTfaConfirmModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div className="card" style={{ width: "380px", padding: "28px", borderRadius: "16px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "17px", fontWeight: "700" }}>Enable Two-Factor Authentication</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                We will send a 6-digit OTP to your registered email address to verify your identity.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTfaConfirmModal(false); setResendAttempts(0); setResendTimer(0); }} style={{ flex: 1, padding: "12px" }} disabled={tfaLoading}>
                  Cancel
                </button>
                <button type="button" onClick={() => requestTfaOtp()} disabled={tfaLoading} className="btn btn-primary" style={{ flex: 1, padding: "12px", opacity: tfaLoading ? 0.7 : 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {tfaLoading ? (
                    <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span> Sending OTP</>
                  ) : "Send OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Disable Confirmation Modal */}
        {showTfaDisableConfirmModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div className="card" style={{ width: "400px", padding: "28px", borderRadius: "16px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "17px", fontWeight: "700" }}>Disable Two-Factor Authentication?</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                This will remove the extra layer of security from your account. A confirmation code will be sent to your registered email to authorize this action.
              </p>
              {disableOtpMsg && !showDisableOtpModal && (
                <p style={{ fontSize: "13px", color: "var(--danger-color)", marginBottom: "16px" }}>{disableOtpMsg}</p>
              )}
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTfaDisableConfirmModal(false)} style={{ flex: 1, padding: "12px" }} disabled={tfaLoading}>
                  Cancel
                </button>
                <button type="button" onClick={requestDisableOtp} disabled={tfaLoading} className="btn btn-primary" style={{ flex: 1, padding: "12px", backgroundColor: "var(--danger-color)", borderColor: "var(--danger-color)", color: "white", opacity: tfaLoading ? 0.7 : 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {tfaLoading ? (
                    <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span> Sending Code...</>
                  ) : "Send Confirmation Code"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Disable OTP Verification Modal */}
        {showDisableOtpModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div className="card" style={{ width: "380px", padding: "28px", borderRadius: "16px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "17px", fontWeight: "700" }}>Confirm 2FA Disable</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Enter the 6-digit code sent to your registered email to confirm disabling 2FA.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                {disableOtpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (disableOtpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleDisableOtpChange(e, index)}
                    onKeyDown={(e) => handleDisableOtpKeyDown(e, index)}
                    disabled={disableOtpPhase === "loading" || disableOtpPhase === "success"}
                    className="form-input"
                    style={{
                      width: "45px", height: "50px", textAlign: "center", fontSize: "20px",
                      fontWeight: "bold", padding: 0, borderRadius: "8px", border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-color)", color: "var(--text-color)"
                    }}
                  />
                ))}
              </div>

              {disableOtpMsg && (
                <div style={{ marginBottom: "16px", fontSize: "13px", fontWeight: "600", color: disableOtpPhase === "error" ? "var(--danger-color)" : "var(--success-color)" }}>
                  {disableOtpMsg}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={verifyDisableOtp}
                disabled={disableOtpCode.join("").length !== 6 || disableOtpPhase === "loading" || disableOtpPhase === "success"}
                style={{ width: "100%", padding: "12px", marginBottom: "12px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "var(--danger-color)", borderColor: "var(--danger-color)" }}
              >
                {disableOtpPhase === "loading" ? (
                  <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span> Verifying...</>
                ) : disableOtpPhase === "success" ? "Verified" : "Verify & Disable"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button type="button" className="btn" onClick={() => {
                    setShowDisableOtpModal(false);
                    setDisableOtpPhase("idle");
                    setDisableOtpMsg("");
                    setDisableOtpCode(["", "", "", "", "", ""]);
                  }} style={{ fontSize: "13px", padding: 0, background: "none", border: "none", color: "var(--text-muted)" }}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={requestDisableOtp}
                  disabled={tfaLoading || disableOtpPhase === "loading" || disableOtpPhase === "success"}
                  style={{ fontSize: "13px", padding: 0, background: "none", border: "none", color: (tfaLoading || disableOtpPhase === "loading" || disableOtpPhase === "success") ? "var(--text-muted)" : "var(--primary-color)", fontWeight: "600" }}
                >
                  {tfaLoading ? "Resending..." : "Resend Code"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div className="card" style={{ width: "380px", padding: "28px", borderRadius: "16px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "17px", fontWeight: "700" }}>Enter OTP Code</h3>
              <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Please enter the 6-digit code sent to your email. It expires in 10 minutes.
              </p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    disabled={otpPhase === "loading" || otpPhase === "success"}
                    className="form-input"
                    style={{
                      width: "45px", height: "50px", textAlign: "center", fontSize: "20px",
                      fontWeight: "bold", padding: 0, borderRadius: "8px", border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-color)", color: "var(--text-color)"
                    }}
                  />
                ))}
              </div>

              {otpMsg && (
                <div style={{ marginBottom: "16px", fontSize: "13px", fontWeight: "600", color: otpPhase === "error" ? "var(--danger-color)" : "var(--success-color)" }}>
                  {otpMsg}
                </div>
              )}

              <button 
                type="button" 
                className="btn btn-primary"
                onClick={verifyTfaOtp} 
                disabled={otpCode.join("").length !== 6 || otpPhase === "loading" || otpPhase === "success"}
                style={{ width: "100%", padding: "12px", marginBottom: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                {otpPhase === "loading" ? (
                  <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span> Verifying...</>
                ) : otpPhase === "success" ? "Verified" : "Verify & Enable"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button type="button" className="btn" onClick={() => { 
                    setShowOtpModal(false); 
                    setTfaEnabled(false); 
                    setResendAttempts(0);
                    setResendTimer(0);
                  }} style={{ fontSize: "13px", padding: 0, background: "none", border: "none", color: "var(--text-muted)" }}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => requestTfaOtp(true)}
                  disabled={isResending || resendTimer > 0 || tfaLoading}
                  style={{ fontSize: "13px", padding: 0, background: "none", border: "none", color: resendTimer > 0 ? "var(--text-muted)" : "var(--primary-color)", fontWeight: "600" }}
                >
                  {isResending ? `Resending OTP${resendDots}` : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogoutModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(8, 17, 32, 0.8)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="card" style={{
            width: "380px", padding: "28px", borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid var(--border-color)",
            textAlign: "center"
          }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700" }}>Logout Session?</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Are you sure you want to end your current session? You will need to sign in again to access the dashboard.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: "12px" }} disabled={logoutLoading}>
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleLogout}
                disabled={logoutLoading}
                style={{ 
                  flex: 1, padding: "12px", fontSize: "14px", fontWeight: "600", 
                  backgroundColor: "var(--danger-color)", color: "#fff", 
                  border: "none", borderRadius: "8px", cursor: logoutLoading ? "not-allowed" : "pointer", opacity: logoutLoading ? 0.7 : 1, 
                  transition: "var(--transition)", display: "flex", alignItems: "center", justifyContent: "center" 
                }}
              >
                {logoutLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                    Logging out...
                  </>
                ) : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="card">Loading Profile Workspace...</div>}>
        <ProfileContent />
      </Suspense>
  );
}
