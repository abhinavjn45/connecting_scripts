const express = require('express');
const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// --- Rate Limiters ---
const tfaRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3, // Max 3 emails per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many 2FA requests. Please wait before requesting another.' }
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 password change attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password change attempts. Please try again later.' }
});

// Helper to fetch permissions
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

// 1. GET /api/profile
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [users] = await db.query('SELECT id, unique_id, first_name, last_name, username, company_email, personal_email, phone_number, bio, gender, joining_date, designation, role, status, two_factor_enabled, profile_image, added_on FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const user = users[0];
    const permissions = await getUserPermissions(userId);

    return res.json({
      success: true,
      user: {
        id: user.id,
        uniqueId: user.unique_id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        companyEmail: user.company_email,
        personalEmail: user.personal_email,
        phoneNumber: user.phone_number,
        bio: user.bio,
        gender: user.gender,
        joiningDate: user.joining_date,
        designation: user.designation,
        role: user.role,
        status: user.status,
        twoFactorEnabled: Boolean(user.two_factor_enabled),
        profileImage: user.profile_image,
        addedOn: user.added_on
      },
      permissions
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error occurred.' });
  }
});

// Helper to extract Cloudinary public_id from resource URL
// Returns null if the public_id does NOT belong to the 'user_avatars' folder (security guard)
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  
  let path = parts[1];
  // Strip version tag (e.g. v1234567/) if present
  if (path.startsWith('v')) {
    const firstSlash = path.indexOf('/');
    if (firstSlash !== -1) {
      path = path.substring(firstSlash + 1);
    }
  }
  
  // Strip file extension
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex !== -1) {
    path = path.substring(0, dotIndex);
  }

  // Security Guard: only allow deletion from the 'user_avatars' folder
  if (!path.startsWith('user_avatars/')) return null;

  return path;
}

// 1b. PUT /api/profile/avatar (Authenticated)
router.put('/avatar', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.status(400).json({ success: false, message: 'Avatar image URL is required.' });
  }

  // Security: Strictly validate that the incoming URL is from our own Cloudinary account
  // and belongs to the user_avatars folder to prevent IDOR via URL manipulation.
  const expectedPublicId = `user_avatars/user_${userId}`;
  const parsedPublicId = getPublicIdFromUrl(avatarUrl);
  if (!parsedPublicId || parsedPublicId !== expectedPublicId) {
    return res.status(400).json({ success: false, message: 'Invalid avatar URL. Must be a valid uploaded avatar from this application.' });
  }

  try {
    // Old avatar cleanup: Since we use overwrite: true with a deterministic public_id
    // (user_avatars/user_<userId>), Cloudinary automatically replaces the old asset.
    // No manual deletion needed, which eliminates the IDOR attack surface entirely.

    // Save new avatar URL to MySQL
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [avatarUrl, userId]);
    return res.json({ success: true, message: 'Profile avatar image successfully saved in database.' });
  } catch (error) {
    console.error('Error updating avatar path:', error);
    return res.status(500).json({ success: false, message: 'Failed to update avatar image path.' });
  }
});

// 1c. PUT /api/profile/change-password (Authenticated)
router.put('/change-password', verifyToken, passwordChangeLimiter, async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  // Strong password complexity validation: at least 8 chars, uppercase, lowercase, number, and special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongPasswordRegex.test(newPassword)) {
    return res.status(400).json({ 
      success: false, 
      message: 'New password must be at least 8 characters long and contain a mix of uppercase, lowercase, numbers, and special characters.' 
    });
  }

  try {
    // 1. Fetch user password hash
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    // 2. Compare current password hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    // Verify that the new password is not identical to the current password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (currentPassword === newPassword || isSame) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password.' });
    }

    // 3. Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    return res.json({ success: true, message: 'Password updated successfully in database.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

// 2. PUT /api/profile
router.put('/', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, phoneNumber, bio, personalEmail } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ success: false, message: 'First name and last name are required.' });
  }

  if (firstName.length > 50 || lastName.length > 50) {
    return res.status(400).json({ success: false, message: 'Name fields cannot exceed 50 characters.' });
  }

  if (bio && bio.length > 100) {
    return res.status(400).json({ success: false, message: 'Bio cannot exceed 100 characters.' });
  }

  try {
    await db.query(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone_number = ?, bio = ?, personal_email = ?
      WHERE id = ?
    `, [firstName, lastName, phoneNumber, bio, personalEmail || null, userId]);

    return res.json({ success: true, message: 'Profile details updated successfully.' });
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// 3. PUT /api/profile/tfa (Legacy - kept for reference, now superseded by /2fa/disable flow)
// Direct disable is blocked — user must go through OTP verification
router.put('/tfa', verifyToken, async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Please use the secure OTP verification flow to disable 2FA.'
  });
});

const { send2FAEmail } = require('../services/emailService');

// 3a. POST /api/profile/2fa/request
router.post('/2fa/request', verifyToken, tfaRequestLimiter, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [users] = await db.query('SELECT first_name, company_email, personal_email FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];
    
    // Generate secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Hash the OTP before saving it to the database
    const hashedOtp = await bcrypt.hash(otpCode, 8);
    
    // Save to database
    await db.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', 
      [hashedOtp, otpExpires, userId]
    );

    // Send the email in the background (fire-and-forget for instant UI response)
    const targetEmail = user.personal_email || user.company_email;
    send2FAEmail(targetEmail, user.first_name, otpCode, 'enable').catch(err => {
      console.error("Background 2FA Email failed:", err);
    });

    return res.json({ success: true, message: 'OTP sent successfully to your registered email.' });
  } catch (error) {
    console.error('Error requesting 2FA OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
  }
});

// 3b. POST /api/profile/2fa/verify
router.post('/2fa/verify', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { otpCode } = req.body;

  if (!otpCode || otpCode.length !== 6) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit OTP.' });
  }

  try {
    const [users] = await db.query('SELECT otp_code, otp_expires_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];

    if (!user.otp_code) {
      return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otpCode, user.otp_code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // OTP is valid, enable 2FA and clear OTP fields
    await db.query('UPDATE users SET two_factor_enabled = 1, otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'Two-Factor Authentication has been successfully enabled.' });
  } catch (error) {
    console.error('Error verifying 2FA OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});

// 3c. POST /api/profile/2fa/disable/request — Send OTP to confirm 2FA disable
router.post('/2fa/disable/request', verifyToken, tfaRequestLimiter, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [users] = await db.query('SELECT first_name, company_email, personal_email, two_factor_enabled FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];
    if (!user.two_factor_enabled) {
      return res.status(400).json({ success: false, message: '2FA is not currently enabled on your account.' });
    }

    // Generate secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedOtp = await bcrypt.hash(otpCode, 8);
    await db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [hashedOtp, otpExpires, userId]);

    const targetEmail = user.personal_email || user.company_email;
    send2FAEmail(targetEmail, user.first_name, otpCode, 'disable').catch(err => {
      console.error('Background 2FA Disable Email failed:', err);
    });

    return res.json({ success: true, message: 'A confirmation code has been sent to your registered email.' });
  } catch (error) {
    console.error('Error requesting 2FA disable OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to send confirmation OTP.' });
  }
});

// 3d. POST /api/profile/2fa/disable/verify — Verify OTP and disable 2FA
router.post('/2fa/disable/verify', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { otpCode } = req.body;

  if (!otpCode || otpCode.length !== 6) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit code.' });
  }

  try {
    const [users] = await db.query('SELECT otp_code, otp_expires_at, two_factor_enabled FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];

    if (!user.two_factor_enabled) {
      return res.status(400).json({ success: false, message: '2FA is not currently enabled on your account.' });
    }

    if (!user.otp_code) {
      return res.status(400).json({ success: false, message: 'No active confirmation code found. Please request a new one.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [userId]);
      return res.status(400).json({ success: false, message: 'Code has expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otpCode, user.otp_code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid confirmation code.' });
    }

    // OTP confirmed — disable 2FA and clear OTP fields
    await db.query('UPDATE users SET two_factor_enabled = 0, otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [userId]);

    return res.json({ success: true, message: 'Two-Factor Authentication has been successfully disabled.' });
  } catch (error) {
    console.error('Error verifying 2FA disable OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to disable 2FA.' });
  }
});

// 4. PUT /api/profile/rbac
router.put('/rbac', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const callerRole = req.user.role;
  const { role, permissions } = req.body;

  if (!['Super Admin', 'Admin'].includes(callerRole)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions. Only Admins can update roles and permissions.' });
  }

  if (role === 'Super Admin' && callerRole !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admins can assign the Super Admin role.' });
  }

  if (!role || !permissions) {
    return res.status(400).json({ success: false, message: 'Role and permissions object are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update user role in users table
    await connection.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    // 2. Delete all existing user permissions in user_module_permissions table
    await connection.query('DELETE FROM user_module_permissions WHERE user_id = ?', [userId]);

    // 3. Re-insert permissions grid rows
    const insertPromises = Object.entries(permissions).map(([moduleKey, p]) => {
      return connection.query(`
        INSERT INTO user_module_permissions (user_id, module_key, can_read, can_create, can_update, can_delete) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, moduleKey, p.read ? 1 : 0, p.create ? 1 : 0, p.update ? 1 : 0, p.delete ? 1 : 0]);
    });

    await Promise.all(insertPromises);
    await connection.commit();

    return res.json({ success: true, message: 'Role and permissions matrix successfully synchronized in MySQL.' });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rollback error during RBAC update:', error);
    return res.status(500).json({ success: false, message: 'Failed to update database permissions.' });
  } finally {
    connection.release();
  }
});

module.exports = router;
