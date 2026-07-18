const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const healthService = require('../services/healthService');
const db = require('../config/db');

// Protect all health routes with verifyToken
router.use(verifyToken);

// GET /api/health/metrics - Retrieve full system health metrics
router.get('/metrics', requirePermission('site_health', 'read'), async (req, res) => {
  try {
    const [system, database, cloudinaryStatus] = await Promise.all([
      healthService.getSystemMetrics(),
      healthService.getDatabaseStatus(),
      healthService.getCloudinaryStatus()
    ]);
    
    // Also fetch the last 10 audit logs for the mini-terminal
    const [auditLogs] = await db.query(`
      SELECT s.*, u.first_name, u.last_name, u.username
      FROM system_audit_logs s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        system,
        database,
        services: {
          cloudinary: cloudinaryStatus
        },
        recentAuditLogs: auditLogs
      }
    });
  } catch (error) {
    console.error('Health API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve health metrics.' });
  }
});

module.exports = router;
