const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
require('dotenv').config();

// === SECURITY BOOT GUARD ===
// Crash immediately if JWT_SECRET is not set or is still the insecure placeholder.
// This prevents the server from ever starting in an insecure state.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('\n[FATAL] JWT_SECRET is not set or is too short in your .env file.');
  console.error('[FATAL] Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  console.error('[FATAL] Server startup aborted.\n');
  process.exit(1);
}

const initializeDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy for Render/Heroku load balancers (fixes express-rate-limit X-Forwarded-For warning)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Strict CSRF Protection Middleware for non-GET requests
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    
    if (origin && !origin.startsWith(allowedOrigin)) {
      console.warn(`[SECURITY] Blocked CSRF attempt from origin: ${origin}`);
      return res.status(403).json({ success: false, message: 'CSRF validation failed: Invalid Origin.' });
    }
  }
  next();
});

// Body and Cookie Parsing Middleware
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Initialize database schema tables on server boot
const backupService = require('./services/backupService');

initializeDatabase().then(() => {
  console.log('Database verification phase completed.');
  // Initialize scheduled backups from the database
  backupService.initScheduledBackups();
});

// Route Handlers
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const assetRoutes = require('./routes/assets');
const usersRoutes = require('./routes/users');
const vaultRoutes = require('./routes/vault');
const backupsRoutes = require('./routes/backups');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/health', healthRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Connecting Scripts Backend API is running successfully with MySQL connection.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

// Global Crash Tracker
const db = require('./config/db');
process.on('uncaughtException', async (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  try {
    await db.query(
      `INSERT INTO system_audit_logs (user_id, module_key, action, details, ip_address) VALUES (NULL, 'system', 'SYSTEM_CRASH', ?, 'localhost')`,
      [err.message || 'Unknown Uncaught Exception']
    );
  } catch (dbErr) {
    console.error('Failed to log crash to DB:', dbErr);
  }
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  try {
    const errorMsg = reason instanceof Error ? reason.message : String(reason);
    await db.query(
      `INSERT INTO system_audit_logs (user_id, module_key, action, details, ip_address) VALUES (NULL, 'system', 'SYSTEM_CRASH', ?, 'localhost')`,
      [`Unhandled Rejection: ${errorMsg}`]
    );
  } catch (dbErr) {
    console.error('Failed to log crash to DB:', dbErr);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
