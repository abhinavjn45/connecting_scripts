const express = require('express');
const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { send2FAEmail } = require('../services/emailService');

const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

// Throw early if key is missing
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.error('[FATAL] VAULT_ENCRYPTION_KEY must be a 64-character hex string in .env');
}

const vaultOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please wait 5 minutes before trying again.' }
});

const vaultRevealLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reveal attempts. Please wait 5 minutes.' }
});


// ---------------------------------------------------------
// Helper: Encryption & Decryption
// ---------------------------------------------------------
function encrypt(text) {
  if (!text) return { encryptedData: null, iv: null, authTag: null };
  const iv = crypto.randomBytes(12); // GCM standard IV size
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

function decrypt(encryptedData, ivHex, authTagHex) {
  if (!encryptedData || !ivHex || !authTagHex) return null;
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}

// ---------------------------------------------------------
// Helper: Permission Check
// ---------------------------------------------------------
async function checkModulePermission(userId, action) {
  const [rows] = await db.query(
    `SELECT can_${action} as has_permission FROM user_module_permissions WHERE user_id = ? AND module_key = 'passwords'`,
    [userId]
  );
  return rows.length > 0 && rows[0].has_permission === 1;
}

// ---------------------------------------------------------
// Route: GET /api/vault/users/search (Search Active Users)
// Note: Must be placed before /:id so 'users' isn't treated as an ID
// ---------------------------------------------------------
router.get('/users/search', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ success: true, users: [] });
  }

  try {
    const hasRead = await checkModulePermission(userId, 'read');
    if (!hasRead && userRole !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to access Password Manager.' });
    }

    const searchTerm = `%${q}%`;
    const [users] = await db.query(`
      SELECT id, first_name, last_name, company_email, personal_email, username, phone_number
      FROM users
      WHERE status = 'Active' AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        company_email LIKE ? OR 
        personal_email LIKE ? OR 
        username LIKE ? OR 
        phone_number LIKE ?
      )
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to search users.' });
  }
});

// ---------------------------------------------------------
// Route: GET /api/vault (List items)
// ---------------------------------------------------------
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const hasRead = await checkModulePermission(userId, 'read');
    if (!hasRead && userRole !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to view the Password Manager.' });
    }

    let items = [];
    if (userRole === 'Super Admin') {
      // Super Admin sees everything
      const [rows] = await db.query(`
        SELECT v.id, v.title, v.url, v.username, v.auth_type, v.oauth_provider, v.notes, v.created_at, v.added_by, u.first_name, u.last_name
        FROM vault_items v
        LEFT JOIN users u ON v.added_by = u.id
        ORDER BY v.created_at DESC
      `);
      items = rows;
    } else {
      // Regular user sees what they created OR what was shared with them
      const [rows] = await db.query(`
        SELECT DISTINCT v.id, v.title, v.url, v.username, v.auth_type, v.oauth_provider, v.notes, v.created_at, v.added_by, u.first_name, u.last_name
        FROM vault_items v
        LEFT JOIN users u ON v.added_by = u.id
        LEFT JOIN vault_item_access a ON v.id = a.item_id
        WHERE v.added_by = ? OR a.user_id = ?
        ORDER BY v.created_at DESC
      `, [userId, userId]);
      items = rows;
    }

    return res.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching vault items:', error);
    return res.status(500).json({ success: false, message: 'Failed to load vault items.' });
  }
});

// ---------------------------------------------------------
// Route: POST /api/vault (Create item)
// ---------------------------------------------------------
router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { title, url, username, authType, oauthProvider, password, notes, assignedUsers } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
  if (authType !== 'password' && authType !== 'oauth') return res.status(400).json({ success: false, message: 'Invalid authentication type.' });

  try {
    const hasCreate = await checkModulePermission(userId, 'create');
    if (!hasCreate && userRole !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to create passwords.' });
    }

    let encrypted = { encryptedData: null, iv: null, authTag: null };
    if (authType === 'password' && password) {
      encrypted = encrypt(password);
    }

    // Insert Item
    const [result] = await db.query(
      `INSERT INTO vault_items (title, url, username, auth_type, oauth_provider, encrypted_password, iv, auth_tag, notes, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, url || null, username || null, authType || 'password', oauthProvider || null, 
        encrypted.encryptedData, encrypted.iv, encrypted.authTag, notes || null, userId
      ]
    );

    const newItemId = result.insertId;

    // Insert Access Rights
    if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      const parsedUsers = assignedUsers.map(uid => Number(uid)).filter(uid => !isNaN(uid) && uid > 0);
      if (parsedUsers.length > 0) {
        const accessValues = parsedUsers.map(uid => [newItemId, uid]);
        await db.query(`INSERT INTO vault_item_access (item_id, user_id) VALUES ?`, [accessValues]);
      }
    }

    // Audit Log
    await db.query(`INSERT INTO vault_audit_logs (user_id, item_id, action) VALUES (?, ?, 'created')`, [userId, newItemId]);

    return res.json({ success: true, message: 'Vault item created successfully.' });
  } catch (error) {
    console.error('Error creating vault item:', error);
    return res.status(500).json({ success: false, message: 'Failed to create vault item.' });
  }
});

// ---------------------------------------------------------
// Route: POST /api/vault/request-otp
// ---------------------------------------------------------
router.post('/request-otp', verifyToken, vaultOtpLimiter, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [users] = await db.query('SELECT first_name, personal_email FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    
    const user = users[0];
    if (!user.personal_email) {
      return res.status(400).json({ success: false, message: 'No personal email configured on your account. Please update your profile.' });
    }
    const targetEmail = user.personal_email;
    
    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    
    const hashedOtp = await bcrypt.hash(otpCode, 8);
    await db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [hashedOtp, otpExpires, userId]);
    
    send2FAEmail(targetEmail, user.first_name, otpCode, 'vault').catch(err => {
      console.error('Failed to send Vault OTP email in background:', err);
    });
    
    return res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error requesting Vault OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP.' });
  }
});

// ---------------------------------------------------------
// Route: POST /api/vault/:id/reveal (Decrypt Password with Auth)
// ---------------------------------------------------------
router.post('/:id/reveal', verifyToken, vaultRevealLimiter, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const itemId = req.params.id;
  const { action, authMethod, authValue } = req.body; 

  if (!authMethod || !authValue) {
    return res.status(400).json({ success: false, message: 'Authorization required to view password.' });
  }

  try {
    // 1. Verify Authentication
    const [users] = await db.query('SELECT password, otp_code, otp_expires_at, failed_login_attempts, last_failed_login_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    const userRecord = users[0];

    // Check if locked out
    if (userRecord.failed_login_attempts >= 5 && userRecord.last_failed_login_at) {
      const lockTime = 15 * 60 * 1000; // 15 mins
      const timeSinceLastFailure = Date.now() - new Date(userRecord.last_failed_login_at).getTime();
      if (timeSinceLastFailure < lockTime) {
        return res.status(429).json({ success: false, message: 'Too many failed authorization attempts. Locked for 15 minutes.' });
      }
    }

    let isAuthValid = false;
    let authErrorMsg = '';

    if (authMethod === 'password') {
      isAuthValid = await bcrypt.compare(authValue, userRecord.password);
      if (!isAuthValid) authErrorMsg = 'Incorrect Dashboard Password.';
    } else if (authMethod === 'otp') {
      if (!userRecord.otp_code || !userRecord.otp_expires_at) {
        authErrorMsg = 'No active OTP found. Please request a new one.';
      } else if (new Date() > new Date(userRecord.otp_expires_at)) {
        await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [userId]);
        authErrorMsg = 'OTP has expired.';
      } else {
        isAuthValid = await bcrypt.compare(authValue, userRecord.otp_code);
        if (!isAuthValid) authErrorMsg = 'Invalid OTP.';
      }
    } else {
      authErrorMsg = 'Invalid auth method.';
    }

    if (!isAuthValid) {
      await db.query(`UPDATE users SET failed_login_attempts = failed_login_attempts + 1, last_failed_login_at = NOW() WHERE id = ?`, [userId]);
      return res.status(401).json({ success: false, message: authErrorMsg });
    }

    // Success! Reset failed attempts
    if (userRecord.failed_login_attempts > 0) {
      await db.query(`UPDATE users SET failed_login_attempts = 0, last_failed_login_at = NULL WHERE id = ?`, [userId]);
    }

    if (authMethod === 'otp') {
      // Clear OTP
      await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [userId]);
    }

    // 2. Verify Vault Access
    let hasAccess = false;
    if (userRole === 'Super Admin') {
      hasAccess = true;
    } else {
      const [accessCheck] = await db.query(
        `SELECT 1 FROM vault_items v 
         LEFT JOIN vault_item_access a ON v.id = a.item_id 
         WHERE v.id = ? AND (v.added_by = ? OR a.user_id = ?)`,
        [itemId, userId, userId]
      );
      if (accessCheck.length > 0) hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have access to this credential.' });
    }

    // 3. Fetch encrypted data
    const [rows] = await db.query(
      `SELECT auth_type, encrypted_password, iv, auth_tag FROM vault_items WHERE id = ?`,
      [itemId]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found.' });
    
    const item = rows[0];
    if (item.auth_type !== 'password') {
      return res.status(400).json({ success: false, message: 'This item does not contain a password (OAuth).' });
    }

    // 4. Decrypt
    const plainTextPassword = decrypt(item.encrypted_password, item.iv, item.auth_tag);
    
    if (plainTextPassword === null) {
      return res.status(500).json({ success: false, message: 'Failed to decrypt password. Data may be corrupted.' });
    }

    // 5. Log Action
    const logAction = (action === 'copied_password') ? 'copied_password' : 'viewed_password';
    await db.query(`INSERT INTO vault_audit_logs (user_id, item_id, action) VALUES (?, ?, ?)`, [userId, itemId, logAction]);

    return res.json({ success: true, password: plainTextPassword });
  } catch (error) {
    console.error('Error revealing password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ---------------------------------------------------------
// Route: GET /api/vault/:id/access (Get assigned users)
// ---------------------------------------------------------
router.get('/:id/access', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const itemId = req.params.id;

  try {
    // 1. Verify access/ownership
    if (userRole !== 'Super Admin') {
      const [ownership] = await db.query(`SELECT 1 FROM vault_items WHERE id = ? AND added_by = ?`, [itemId, userId]);
      if (ownership.length === 0) {
        const [accessCheck] = await db.query(`SELECT 1 FROM vault_item_access WHERE item_id = ? AND user_id = ?`, [itemId, userId]);
        if (accessCheck.length === 0) {
           return res.status(403).json({ success: false, message: 'You do not have permission to view the access list for this item.' });
        }
      }
    }

    const [rows] = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.company_email, u.username 
      FROM vault_item_access a
      JOIN users u ON a.user_id = u.id
      WHERE a.item_id = ?
    `, [itemId]);
    return res.json({ success: true, assignedUsers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned users.' });
  }
});

// ---------------------------------------------------------
// Route: PUT /api/vault/:id (Update item)
// ---------------------------------------------------------
router.put('/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const itemId = req.params.id;
  const { title, url, username, authType, oauthProvider, password, notes, assignedUsers } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
  if (authType !== 'password' && authType !== 'oauth') return res.status(400).json({ success: false, message: 'Invalid authentication type.' });

  try {
    const hasUpdate = await checkModulePermission(userId, 'update');
    if (!hasUpdate && userRole !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to update passwords.' });
    }

    // Verify ownership/access if not Super Admin
    if (userRole !== 'Super Admin') {
      const [ownership] = await db.query(`SELECT 1 FROM vault_items WHERE id = ? AND added_by = ?`, [itemId, userId]);
      if (ownership.length === 0) {
        return res.status(403).json({ success: false, message: 'Only the original creator can edit this credential.' });
      }
    }

    // If a new password is provided, re-encrypt it. Otherwise keep existing.
    if (authType === 'password' && password) {
      const encrypted = encrypt(password);
      await db.query(
        `UPDATE vault_items 
         SET title = ?, url = ?, username = ?, auth_type = ?, oauth_provider = ?, encrypted_password = ?, iv = ?, auth_tag = ?, notes = ?
         WHERE id = ?`,
        [title, url || null, username || null, authType, oauthProvider || null, encrypted.encryptedData, encrypted.iv, encrypted.authTag, notes || null, itemId]
      );
    } else {
      // Keep old password, just update details
      await db.query(
        `UPDATE vault_items 
         SET title = ?, url = ?, username = ?, auth_type = ?, oauth_provider = ?, notes = ?
         WHERE id = ?`,
        [title, url || null, username || null, authType || 'password', oauthProvider || null, notes || null, itemId]
      );
    }

    // Update Access Rights
    // 1. Delete old rights
    await db.query(`DELETE FROM vault_item_access WHERE item_id = ?`, [itemId]);
    
    // 2. Insert new rights
    if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      const parsedUsers = assignedUsers.map(uid => Number(uid)).filter(uid => !isNaN(uid) && uid > 0);
      if (parsedUsers.length > 0) {
        const accessValues = parsedUsers.map(uid => [itemId, uid]);
        await db.query(`INSERT INTO vault_item_access (item_id, user_id) VALUES ?`, [accessValues]);
      }
    }

    await db.query(`INSERT INTO vault_audit_logs (user_id, item_id, action) VALUES (?, ?, 'edited')`, [userId, itemId]);

    return res.json({ success: true, message: 'Vault item updated successfully.' });
  } catch (error) {
    console.error('Error updating vault item:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vault item.' });
  }
});

// ---------------------------------------------------------
// Route: DELETE /api/vault/:id
// ---------------------------------------------------------
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const itemId = req.params.id;

  try {
    const hasDelete = await checkModulePermission(userId, 'delete');
    if (!hasDelete && userRole !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete passwords.' });
    }

    // Verify ownership/access if not Super Admin
    if (userRole !== 'Super Admin') {
      const [ownership] = await db.query(`SELECT 1 FROM vault_items WHERE id = ? AND added_by = ?`, [itemId, userId]);
      if (ownership.length === 0) {
        return res.status(403).json({ success: false, message: 'You can only delete items you created.' });
      }
    }

    await db.query(`DELETE FROM vault_items WHERE id = ?`, [itemId]);
    
    return res.json({ success: true, message: 'Vault item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting vault item:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete vault item.' });
  }
});

module.exports = router;
