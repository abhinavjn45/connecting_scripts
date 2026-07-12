const express = require('express');
const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

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
  return path;
}

// 1b. PUT /api/profile/avatar (Authenticated)
router.put('/avatar', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.status(400).json({ success: false, message: 'Avatar image URL is required.' });
  }

  try {
    // 1. Fetch current profile image to delete from Cloudinary
    const [users] = await db.query('SELECT profile_image FROM users WHERE id = ?', [userId]);
    if (users.length > 0 && users[0].profile_image) {
      const oldImage = users[0].profile_image;
      const publicId = getPublicIdFromUrl(oldImage);
      if (publicId) {
        console.log(`[Cloudinary Cleanup]: Deleting old avatar with public ID: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 2. Save new avatar URL to MySQL
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [avatarUrl, userId]);
    return res.json({ success: true, message: 'Profile avatar image successfully saved in database and old cloud asset purged.' });
  } catch (error) {
    console.error('Error updating avatar path:', error);
    return res.status(500).json({ success: false, message: 'Failed to update avatar image path.' });
  }
});

// 1c. PUT /api/profile/change-password (Authenticated)
router.put('/change-password', verifyToken, async (req, res) => {
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

// 3. PUT /api/profile/tfa
router.put('/tfa', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { twoFactorEnabled } = req.body;

  try {
    await db.query('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [twoFactorEnabled ? 1 : 0, userId]);
    return res.json({ success: true, message: `Two-Factor Authentication toggled ${twoFactorEnabled ? 'ON' : 'OFF'}.` });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    return res.status(500).json({ success: false, message: 'Failed to update 2FA status.' });
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
