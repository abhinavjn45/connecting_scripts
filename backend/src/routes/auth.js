const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

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
router.post('/login', async (req, res) => {
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

    // Verify hashed password
    // (Seeds password hash is '$2b$10$95XvIqfI37oP3jQvKvhOEuVwQ1k.L2mO12u8T416XhB.YFpA.P1kG' for "admin123")
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Reset failed login count
    await db.query('UPDATE users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = ?', [user.id]);

    // Check Multi-Factor status (2FA)
    if (user.two_factor_enabled === 1) {
      // Generate a secure 6-digit random code
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
      
      await db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [otpCode, otpExpires, user.id]);
      
      // Log code to the terminal console so the user can retrieve it easily in local development
      console.log(`\n==========================================`);
      console.log(`[2FA OTP CODE DISPATCHED FOR ${email}]: ${otpCode}`);
      console.log(`==========================================\n`);

      return res.json({
        success: true,
        requires2fa: true,
        email: user.company_email,
        message: 'Multi-factor authentication code sent.'
      });
    }

    // Direct Login (No 2FA)
    const permissions = await getUserPermissions(user.id);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.company_email, permissions },
      process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      requires2fa: false,
      token,
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
router.post('/verify-2fa', async (req, res) => {
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

    // Check OTP validity and expiration
    if (!user.otp_code || user.otp_code !== otp_code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    const expiryTime = new Date(user.otp_expires_at).getTime();
    if (Date.now() > expiryTime) {
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    // Clear OTP in DB upon success
    await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);

    const permissions = await getUserPermissions(user.id);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.company_email, permissions },
      process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
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

module.exports = router;
