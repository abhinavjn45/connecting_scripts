const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const auditService = require('../services/auditService');
const rateLimit = require('express-rate-limit');

// Robust XSS escape function
const escapeHTML = (str) => {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
};

const ALLOWED_SETTINGS_KEYS = [
  'site_fullname', 'site_url', 'dashboard_url', 'timezone', 'footer_text',
  'logo_main', 'logo_small', 'logo_small_dark', 'logo_light', 'logo_dark',
  'android_chrome_192x192', 'android_chrome_512x512', 'apple_touch_icon',
  'favicon_ico', 'favicon_16x16', 'favicon_32x32',
  'social_facebook', 'social_twitter', 'social_linkedin', 'social_instagram'
];

const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests for settings, please try again later.' }
});

// Middleware to check specific module permissions (reused pattern)
const requirePermission = (moduleKey, action) => {
  return async (req, res, next) => {
    // Super Admins have full access
    if (req.user.role === 'Super Admin') return next();

    try {
      const [rows] = await db.query(
        `SELECT can_${action} as has_permission FROM user_module_permissions WHERE user_id = ? AND module_key = ?`,
        [req.user.userId, moduleKey]
      );

      if (rows.length === 0 || rows[0].has_permission !== 1) {
        return res.status(403).json({ success: false, message: `Access denied. You lack ${action} permission for ${moduleKey}.` });
      }
      next();
    } catch (error) {
      console.error(`Permission check error:`, error);
      res.status(500).json({ success: false, message: 'Server error during authorization.' });
    }
  };
};

// GET /api/settings - Fetch all global site settings
// Made public so the frontend can consume these settings without authentication
router.get('/', settingsLimiter, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT setting_key, setting_value, setting_description FROM site_settings WHERE setting_key IN (?)',
      [ALLOWED_SETTINGS_KEYS]
    );
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch site settings.' });
  }
});

// PUT /api/settings - Update multiple site settings
router.put('/', verifyToken, requirePermission('settings', 'update'), async (req, res) => {
  const settingsToUpdate = req.body; // e.g. { site_url: "https...", site_fullname: "Connecting Scripts" }

  if (!settingsToUpdate || typeof settingsToUpdate !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const keys = Object.keys(settingsToUpdate).filter(key => ALLOWED_SETTINGS_KEYS.includes(key));
    for (const key of keys) {
      let value = settingsToUpdate[key];
      // Skip if value is undefined
      if (value === undefined) continue;
      
      value = String(value).trim();
      
      // Validate URLs (URLs must start with http, https, or / for relative paths)
      if (key.includes('url') || key.startsWith('social_') || key.includes('logo') || key.includes('favicon')) {
         if (value && !/^https?:\/\//i.test(value) && !value.startsWith('/')) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Invalid URL format for ${key}. Must start with http://, https://, or /` });
         }
      } else {
         // Sanitize text fields robustly to prevent XSS
         value = escapeHTML(value);
      }

      // We don't update setting_description here because it's usually static metadata,
      // but we use ON DUPLICATE KEY UPDATE to elegantly insert or update the value.
      await connection.query(
        `INSERT INTO site_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
      );
    }

    await connection.commit();

    await auditService.logAction(req.user.userId, 'settings', 'UPDATE_SETTINGS', JSON.stringify({ updated_keys: keys }), req);

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  } finally {
    connection.release();
  }
});

module.exports = router;
