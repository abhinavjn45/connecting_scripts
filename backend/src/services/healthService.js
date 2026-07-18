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

  /**
   * Pings the public frontend to ensure it is online.
   */
  async getFrontendStatus() {
    try {
      const url = process.env.PUBLIC_FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
      const start = Date.now();
      const res = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) 
      });
      const responseTime = Date.now() - start;

      if (!res.ok && res.status >= 500) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      return {
        status: 'online',
        responseTimeMs: responseTime,
        url
      };
    } catch (error) {
      console.error('HealthService: Frontend ping failed', error);
      return {
        status: 'offline',
        responseTimeMs: null,
        error: error.message
      };
    }
  }

  /**
   * Pings the Resend Email API to verify authentication and service health.
   */
  async getEmailServiceStatus() {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured in .env');
      }

      const start = Date.now();
      // A safe, read-only endpoint to verify the API key is active
      const res = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        signal: AbortSignal.timeout(5000)
      });
      const responseTime = Date.now() - start;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Resend Error ${res.status}: ${errorData.message || res.statusText}`);
      }

      return {
        status: 'online',
        responseTimeMs: responseTime
      };
    } catch (error) {
      console.error('HealthService: Email service ping failed', error);
      return {
        status: 'offline',
        responseTimeMs: null,
        error: error.message
      };
    }
  }

  /**
   * Tracks internal Node.js process memory usage.
   */
  getNodeProcessMetrics() {
    const memUsage = process.memoryUsage();
    return {
      rss: memUsage.rss,       // Resident Set Size (total memory allocated for the process)
      heapTotal: memUsage.heapTotal, // V8's memory usage
      heapUsed: memUsage.heapUsed,
      external: memUsage.external
    };
  }
}

module.exports = new HealthService();
