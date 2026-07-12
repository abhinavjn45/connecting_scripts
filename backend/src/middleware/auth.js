const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function verifyToken(req, res, next) {
  // Extract token from cookie (primary) or Authorization header (fallback/testing)
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No session token found.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Live DB Check: Ensure user is still active (L-1 fix)
    const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [decoded.userId]);
    if (!rows[0] || rows[0].status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is not active or has been suspended.' });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or expired session authorization token.'
    });
  }
}

module.exports = verifyToken;
