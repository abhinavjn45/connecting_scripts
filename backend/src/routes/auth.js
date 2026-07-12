const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');

// --- Rate Limiters ---

// Login: max 10 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// 2FA OTP: max 10 attempts per IP per 5 minutes (matches OTP lifespan)
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please request a new code.' }
});

// Maximum failed login attempts before account lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// Helper to fetch and format user permissions
async function getUserPermissions(userId) {
  const [rows] = await db.query(`
    SELECT module_key, can_read, can_create, can_update, can_delete 
    FROM user_module_permissions 
    WHERE user_id = ?
  `, [userId]);

  const perms = {};
  rows.forEach(r => {
    perms[r.module_key] = {
      read: Boolean(r.can_read),
      create: Boolean(r.can_create),
      update: Boolean(r.can_update),
      delete: Boolean(r.can_delete)
    };
  });
  return perms;
}

// 1. POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
  }

  try {
    // Retrieve user details from database
    const [users] = await db.query('SELECT * FROM users WHERE company_email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Access denied. Your account status is: ${user.status}.` });
    }

    // Check if account is temporarily locked out due to too many failed attempts
    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = new Date(new Date(user.last_failed_login_at || Date.now()).getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      if (Date.now() < lockoutUntil.getTime()) {
        const minutesLeft = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Account temporarily locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${minutesLeft} minute(s).`
        });
      }
      // Lockout period has passed — reset counter
      await db.query('UPDATE users SET failed_login_attempts = 0 WHERE id = ?', [user.id]);
    }

    // Verify hashed password (async to avoid blocking the event loop)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Increment failed attempt counter and record timestamp
      await db.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1, last_failed_login_at = NOW() WHERE id = ?',
        [user.id]
      );
      const attemptsNow = (user.failed_login_attempts || 0) + 1;
      const remaining = MAX_FAILED_ATTEMPTS - attemptsNow;
      const msg = remaining > 0
        ? `Invalid email or password. ${remaining} attempt(s) remaining before lockout.`
        : `Invalid email or password. Account is now locked for ${LOCKOUT_DURATION_MINUTES} minutes.`;
      return res.status(401).json({ success: false, message: msg });
    }

    // Reset failed login count
    await db.query('UPDATE users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = ?', [user.id]);

    // Check Multi-Factor status (2FA)
    if (user.two_factor_enabled === 1) {
      // Generate a secure 6-digit random code
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

      // Hash the OTP before storing — a plain-text OTP in the DB is a security risk
      // (cost 8 is sufficient for short-lived codes and keeps latency low)
      const hashedOtp = await bcrypt.hash(otpCode, 8);
      await db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [hashedOtp, otpExpires, user.id]);



      return res.json({
        success: true,
        requires2fa: true,
        email: user.company_email,
        message: 'Multi-factor authentication code sent.'
      });
    }

    // Direct Login (No 2FA)
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.company_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    return res.json({
      success: true,
      requires2fa: false,
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.company_email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error occurred.' });
  }
});

// 2. POST /api/auth/verify-2fa
router.post('/verify-2fa', otpLimiter, async (req, res) => {
  const { email, otp_code } = req.body;

  if (!email || !otp_code) {
    return res.status(400).json({ success: false, message: 'Please provide both email and verification code.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE company_email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];

    // Check expiry first — avoids wasting bcrypt CPU on expired codes
    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ success: false, message: 'No active verification code found. Please log in again.' });
    }

    const expiryTime = new Date(user.otp_expires_at).getTime();
    if (Date.now() > expiryTime) {
      // Clear expired OTP
      await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    // Verify user input against the stored bcrypt hash
    const otpMatch = await bcrypt.compare(otp_code, user.otp_code);
    if (!otpMatch) {
      await db.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1, last_failed_login_at = NOW() WHERE id = ?',
        [user.id]
      );
      const attemptsNow = (user.failed_login_attempts || 0) + 1;
      if (attemptsNow >= MAX_FAILED_ATTEMPTS) {
        await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);
        return res.status(401).json({ success: false, message: `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts.` });
      }
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    // Clear OTP in DB upon success
    await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.company_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    return res.json({
      success: true,
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.company_email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error occurred.' });
  }
});

// 3. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
