const si = require('systeminformation');
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

class HealthService {
  /**
   * Retrieves comprehensive system and application metrics.
   */
  async getSystemMetrics() {
    try {
      const [cpu, mem, osInfo, disk] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.osInfo(),
        si.fsSize()
      ]);

      const diskInfo = disk.find(d => d.use > 0) || disk[0];

      return {
        cpu: {
          usagePercent: cpu.currentLoad.toFixed(2),
          cores: cpu.cpus.length
        },
        memory: {
          total: mem.total,
          used: mem.active,
          free: mem.available,
          usagePercent: ((mem.active / mem.total) * 100).toFixed(2)
        },
        disk: {
          size: diskInfo.size,
          used: diskInfo.used,
          available: diskInfo.available,
          usagePercent: diskInfo.use.toFixed(2)
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          uptime: require('os').uptime() // in seconds
        }
      };
    } catch (error) {
      console.error('HealthService: Failed to retrieve system metrics', error);
      throw new Error('Failed to retrieve system metrics');
    }
  }

  /**
   * Pings the database to check connectivity and connection pool status.
   */
  async getDatabaseStatus() {
    try {
      const start = Date.now();
      const [rows] = await db.query('SELECT 1');
      const responseTime = Date.now() - start;

      // Try to get some basic stats about the db size
      let dbSize = 0;
      try {
        const [sizeRows] = await db.query(`
          SELECT SUM(data_length + index_length) AS size 
          FROM information_schema.TABLES 
          WHERE table_schema = ?
        `, [process.env.DB_NAME]);
        dbSize = sizeRows[0].size;
      } catch(e) {
        // Fallback or ignore if user doesn't have permission to query information_schema
      }

      return {
        status: 'online',
        responseTimeMs: responseTime,
        databaseSize: dbSize
      };
    } catch (error) {
      console.error('HealthService: Database ping failed', error);
      return {
        status: 'offline',
        responseTimeMs: null,
        error: error.message
      };
    }
  }

  /**
   * Checks the status of the Cloudinary API connection.
   */
  async getCloudinaryStatus() {
    try {
      const start = Date.now();
      await cloudinary.api.ping();
      const responseTime = Date.now() - start;
      return {
        status: 'online',
        responseTimeMs: responseTime
      };
    } catch (error) {
      console.error('HealthService: Cloudinary ping failed', error);
      return {
        status: 'offline',
        responseTimeMs: null,
        error: error.message
      };
    }
  }
}

module.exports = new HealthService();
