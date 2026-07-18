const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const db = require('../config/db');
const EventEmitter = require('events');

class BackupEmitter extends EventEmitter {}
const backupEvents = new BackupEmitter();

let currentBackupStatus = {
  isBackingUp: false,
  progress: 0,
  message: '',
  error: null
};

function updateProgress(progress, message, error = null) {
  currentBackupStatus = { isBackingUp: progress < 100 && !error, progress, message, error };
  backupEvents.emit('progress', currentBackupStatus);
}

// Map to hold active cron jobs: { scheduleId: cronJobInstance }
const scheduledJobs = {};

// Configure Cloudinary if not already configured elsewhere
// Assuming the env variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are present
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cleanup old backups from Cloudinary
 * Deletes any raw resource in the 'database_backups' folder older than 30 days
 */
async function cleanupOldBackups() {
  try {
    console.log('[Backup] Checking for backups older than 30 days to clean up...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch resources with prefix
    let hasMore = true;
    let nextCursor = null;
    let toDelete = [];

    while (hasMore) {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: 'database_backups/',
        max_results: 100,
        next_cursor: nextCursor
      });

      for (const res of result.resources) {
        const createdAt = new Date(res.created_at);
        if (createdAt < thirtyDaysAgo) {
          toDelete.push(res.public_id);
        }
      }

      if (result.next_cursor) {
        nextCursor = result.next_cursor;
      } else {
        hasMore = false;
      }
    }

    if (toDelete.length > 0) {
      console.log(`[Backup] Found ${toDelete.length} old backups. Deleting...`);
      // Cloudinary allows deleting up to 100 resources at once
      for (let i = 0; i < toDelete.length; i += 100) {
        const chunk = toDelete.slice(i, i + 100);
        await cloudinary.api.delete_resources(chunk, { resource_type: 'raw' });
      }
      console.log('[Backup] Cleanup complete.');
    } else {
      console.log('[Backup] No old backups found.');
    }
  } catch (error) {
    console.error('[Backup] Error during cleanup:', error);
  }
}

/**
 * Generate a database dump and upload it to Cloudinary
 */
async function performBackup() {
  if (currentBackupStatus.isBackingUp) return; // Prevent concurrent manual backups

  updateProgress(5, 'Initializing backup process...');
  
  // Calculate IST timestamp (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(Date.now() + istOffset);
  const timestamp = istDate.toISOString().replace(/[:.]/g, '-').slice(0, 19); // e.g. 2026-07-12T23-59-00
  const filename = `db_backup_${timestamp}.sql`;
  const filepath = path.join(__dirname, '../../', filename);

  try {
    updateProgress(25, `Dumping database to ${filename}...`);
    console.log(`[Backup] Starting database dump to ${filename}...`);
    
    // Dump the database to a local file
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
      },
      dumpToFile: filepath,
    });

    updateProgress(60, 'Dump successful. Uploading to secure cloud storage...');
    console.log('[Backup] Dump successful. Uploading to Cloudinary...');

    // Upload to Cloudinary
    // Using resource_type: 'raw' for non-media files like .sql
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      resource_type: 'raw',
      folder: 'database_backups',
      public_id: filename, 
      use_filename: true,
      unique_filename: false
    });

    updateProgress(85, 'Upload successful. Cleaning up older backups...');
    console.log(`[Backup] Upload successful: ${uploadResult.secure_url}`);

    // Clean up local file
    fs.unlinkSync(filepath);
    console.log(`[Backup] Local file ${filename} removed.`);

    // After a successful backup, cleanup older backups
    await cleanupOldBackups();

    updateProgress(100, 'Backup process completed successfully.');
  } catch (error) {
    console.error('[Backup] Error during backup process:', error);
    updateProgress(0, 'Backup failed. Please check the logs.', error.message);
    // Try to cleanup local file if it exists but upload failed
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}

/**
 * Schedule a specific backup dynamically
 */
function scheduleBackup(id, timeStr) {
  cancelScheduledBackup(id); // Ensure no duplicate runs if already scheduled

  // timeStr is 'HH:mm'
  const [hour, minute] = timeStr.split(':');
  // Cron expression for daily at HH:mm
  const cronExpr = `${minute} ${hour} * * *`;

  const job = cron.schedule(cronExpr, () => {
    console.log(`[Cron] Running dynamically scheduled database backup (Schedule ID: ${id}) at ${timeStr}...`);
    performBackup();
  }, { timezone: 'Asia/Kolkata' });

  scheduledJobs[id] = job;
  console.log(`[BackupService] Scheduled backup ID ${id} at ${timeStr}`);
}

/**
 * Cancel a specific scheduled backup
 */
function cancelScheduledBackup(id) {
  if (scheduledJobs[id]) {
    scheduledJobs[id].stop();
    delete scheduledJobs[id];
    console.log(`[BackupService] Cancelled backup schedule ID ${id}`);
  }
}

/**
 * Initialize all active scheduled backups from the database on startup
 */
async function initScheduledBackups() {
  try {
    const [rows] = await db.query('SELECT id, schedule_time FROM backup_schedules WHERE is_active = TRUE');
    console.log(`[BackupService] Found ${rows.length} active backup schedules in database.`);
    
    rows.forEach(schedule => {
      scheduleBackup(schedule.id, schedule.schedule_time);
    });
  } catch (error) {
    console.error('[BackupService] Failed to initialize scheduled backups:', error);
  }
}

module.exports = {
  performBackup,
  scheduleBackup,
  cancelScheduledBackup,
  initScheduledBackups,
  backupEvents,
  getCurrentBackupStatus: () => currentBackupStatus
};
