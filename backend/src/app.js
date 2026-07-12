const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const initializeDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database schema tables on server boot
initializeDatabase().then(() => {
  console.log('Database verification phase completed.');
});

// Route Handlers
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const assetRoutes = require('./routes/assets');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', usersRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Root Route
app.get('/', (req, res) => {
  res.send('SEOC Backend API is running successfully with MySQL connection.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
