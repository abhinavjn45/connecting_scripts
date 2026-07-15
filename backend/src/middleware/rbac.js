const db = require('../config/db');

/**
 * Middleware factory to enforce module-level permissions for routes.
 * 
 * @param {string} moduleKey - The unique key of the module (e.g., 'users', 'blogs')
 * @param {string} action - The action being performed ('read', 'create', 'update', 'delete')
 */
function requirePermission(moduleKey, action) {
  return async (req, res, next) => {
    try {
      // 1. Check if the user is authenticated (verifyToken should have run first)
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized. No active session found.' });
      }

      const userId = req.user.userId;

      // 2. Query the database for this specific permission
      const column = `can_${action}`;
      const [rows] = await db.query(
        `SELECT ?? FROM user_module_permissions WHERE user_id = ? AND module_key = ?`,
        [column, userId, moduleKey]
      );

      // 3. Verify if permission exists and is granted
      if (!rows || rows.length === 0 || !rows[0][column]) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: You do not have permission to ${action.toUpperCase()} entries in the ${moduleKey} module.`
        });
      }

      // 4. Permission verified
      next();
    } catch (error) {
      console.error(`RBAC Middleware Error (${moduleKey}:${action}):`, error);
      return res.status(500).json({ success: false, message: 'Internal server error verifying permissions.' });
    }
  };
}

module.exports = { requirePermission };
