const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const backupService = require('../services/backupService');
const auditService = require('../services/auditService');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.use(verifyToken);

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admins can manage backup schedules.' });
  }
  next();
};

// GET /api/backups/schedules - List all schedules
router.get('/schedules', requirePermission('backups', 'create'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT bs.*, u.first_name, u.last_name 
      FROM backup_schedules bs
      JOIN users u ON bs.added_by = u.id
      ORDER BY bs.schedule_time ASC
    `);
    res.json({ success: true, schedules: rows });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/backups/schedules - Add a new schedule
router.post('/schedules', requirePermission('backups', 'create'), async (req, res) => {
  const { schedule_time } = req.body;
  if (!schedule_time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(schedule_time)) {
    return res.status(400).json({ success: false, message: 'Invalid time format. Use HH:mm' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM backup_schedules WHERE schedule_time = ?', [schedule_time]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A schedule for this time already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO backup_schedules (schedule_time, added_by, is_active) VALUES (?, ?, ?)',
      [schedule_time, req.user.userId, true]
    );

    backupService.scheduleBackup(result.insertId, schedule_time);
    
    await auditService.logAction(req.user.userId, 'backups', 'CREATE_SCHEDULE', JSON.stringify({ schedule_time }), req);

    res.json({ success: true, message: 'Schedule created successfully.', id: result.insertId });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/backups/schedules/:id - Update a schedule (e.g., toggle active)
router.put('/schedules/:id', requirePermission('backups', 'update'), async (req, res) => {
  const scheduleId = req.params.id;
  const { is_active } = req.body;

  try {
    const [schedule] = await db.query('SELECT schedule_time FROM backup_schedules WHERE id = ?', [scheduleId]);
    if (schedule.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await db.query('UPDATE backup_schedules SET is_active = ? WHERE id = ?', [is_active, scheduleId]);

    if (is_active) {
      backupService.scheduleBackup(scheduleId, schedule[0].schedule_time);
    } else {
      backupService.cancelScheduledBackup(scheduleId);
    }
    
    await auditService.logAction(req.user.userId, 'backups', 'UPDATE_SCHEDULE', JSON.stringify({ scheduleId, is_active }), req);

    res.json({ success: true, message: 'Schedule updated successfully.' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/backups/schedules/:id - Delete a schedule
router.delete('/schedules/:id', requirePermission('backups', 'delete'), async (req, res) => {
  const scheduleId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM backup_schedules WHERE id = ?', [scheduleId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    backupService.cancelScheduledBackup(scheduleId);
    
    await auditService.logAction(req.user.userId, 'backups', 'DELETE_SCHEDULE', JSON.stringify({ scheduleId }), req);
    
    res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/backups/history - Fetch history from Database
router.get('/history', requirePermission('backups', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    const { search, sortBy, sortOrder } = req.query;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (search) {
      whereClause += ' AND public_id LIKE ?';
      queryParams.push(`%${search}%`);
    }

    const [[{ totalCount }]] = await db.query(`SELECT COUNT(*) AS totalCount FROM backup_history ${whereClause}`, queryParams);

    const validSortColumns = {
      'name': 'public_id',
      'size': 'size',
      'created_at': 'created_at'
    };
    const dbSortColumn = validSortColumns[sortBy] || 'created_at';
    const dbSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await db.query(`
      SELECT public_id AS id, 
             SUBSTRING_INDEX(public_id, '/', -1) AS name, 
             url, size, created_at
      FROM backup_history
      ${whereClause}
      ORDER BY ${dbSortColumn} ${dbSortOrder}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    res.json({ 
      success: true, 
      backups: rows,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching backup history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/backups/history/bulk-delete - Delete single/multiple backups
router.post('/history/bulk-delete', requirePermission('backups', 'delete'), async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'An array of backup IDs is required.' });
  }

  // Validate IDs to prevent IDOR (only allow database_backups)
  const invalidIds = ids.filter(id => typeof id !== 'string' || !id.startsWith('database_backups/'));
  if (invalidIds.length > 0) {
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid backup IDs provided.' });
  }

  try {
    // Cloudinary allows deleting up to 100 resources in a single call
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      await cloudinary.api.delete_resources(chunk, { resource_type: 'raw' });
      await db.query('DELETE FROM backup_history WHERE public_id IN (?)', [chunk]);
    }
    
    await auditService.logAction(req.user.userId, 'backups', 'BULK_DELETE', JSON.stringify({ count: ids.length, ids }), req);
    
    res.json({ success: true, message: 'Backups deleted successfully.' });
  } catch (error) {
    console.error('Error deleting backups:', error);
    res.status(500).json({ success: false, message: 'Failed to delete backups.' });
  }
});

// GET /api/backups/status - Check if backup is running
router.get('/status', requirePermission('backups', 'read'), (req, res) => {
  const status = backupService.getCurrentBackupStatus();
  res.json({ success: true, ...status });
});

// GET /api/backups/progress - SSE Endpoint for live progress
router.get('/progress', requirePermission('backups', 'read'), (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current status immediately
  res.write(`data: ${JSON.stringify(backupService.getCurrentBackupStatus())}\n\n`);

  // Event listener for progress updates
  const progressListener = (status) => {
    res.write(`data: ${JSON.stringify(status)}\n\n`);
    // If complete or errored, we can optionally end the stream, but the client can close it
  };

  backupService.backupEvents.on('progress', progressListener);

  // Clean up when client disconnects
  req.on('close', () => {
    backupService.backupEvents.removeListener('progress', progressListener);
  });
});

// POST /api/backups/manual - Trigger manual backup immediately
router.post('/manual', requirePermission('backups', 'create'), async (req, res) => {
  const status = backupService.getCurrentBackupStatus();
  if (status.isBackingUp) {
    return res.status(400).json({ success: false, message: 'A backup is already in progress.' });
  }

  try {
    // We don't await this because it runs in the background. 
    // The SSE endpoint will report its progress.
    backupService.performBackup();
    
    await auditService.logAction(req.user.userId, 'backups', 'MANUAL_BACKUP', 'Triggered a manual database backup', req);

    res.json({ success: true, message: 'Manual backup started.' });
  } catch (error) {
    console.error('Error triggering manual backup:', error);
    res.status(500).json({ success: false, message: 'Failed to start backup' });
  }
});

module.exports = router;
