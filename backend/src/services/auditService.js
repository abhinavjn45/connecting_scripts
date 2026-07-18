const db = require('../config/db');

class AuditService {
  /**
   * Log an action to the system audit logs.
   * @param {number} userId - ID of the user performing the action
   * @param {string} moduleKey - The module where the action happened (e.g., 'backups')
   * @param {string} action - The specific action (e.g., 'CREATE_BACKUP', 'DELETE_SCHEDULE')
   * @param {string} details - Additional context or JSON stringified details
   * @param {Object} req - The Express request object (optional)
   */
  async logAction(userId, moduleKey, action, details = null, req = null) {
    if (!userId || !moduleKey || !action) {
      console.warn('AuditService: Missing required fields for logging action.');
      return false;
    }

    let ipAddress = null;
    if (req) {
      // Extract the real IP address, prioritizing X-Forwarded-For for proxy/load-balancer environments
      const forwardedIps = req.headers['x-forwarded-for'];
      ipAddress = forwardedIps 
        ? forwardedIps.split(',')[0].trim() 
        : req.socket?.remoteAddress || req.ip;
    }

    try {
      await db.query(
        'INSERT INTO system_audit_logs (user_id, module_key, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
        [userId, moduleKey, action, details, ipAddress]
      );
      return true;
    } catch (error) {
      console.error('AuditService: Error logging action to database:', error);
      return false;
    }
  }
}

module.exports = new AuditService();
