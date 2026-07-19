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
    const [system, database, cloudinaryStatus, frontendStatus, emailStatus, watchdog, security] = await Promise.all([
      healthService.getSystemMetrics(),
      healthService.getDatabaseStatus(),
      healthService.getCloudinaryStatus(),
      healthService.getFrontendStatus(),
      healthService.getEmailServiceStatus(),
      healthService.getBackupWatchdogStatus(),
      healthService.getSecurityTracker()
    ]);
    
    res.json({
      success: true,
      data: {
        system,
        nodeProcess: healthService.getNodeProcessMetrics(),
        database,
        services: {
          cloudinary: cloudinaryStatus,
          frontend: frontendStatus,
          email: emailStatus,
          watchdog,
          security
        }
      }
    });
  } catch (error) {
    console.error('Health API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve health metrics.' });
  }
});

module.exports = router;
