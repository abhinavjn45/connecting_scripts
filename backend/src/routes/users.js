const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const verifyToken = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (!['Super Admin', 'Admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
  }
  next();
}

// GET /api/users - List all users
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        id, unique_id, first_name, last_name, username,
        company_email, personal_email, phone_number,
        gender, designation, role, status, profile_image,
        joining_date, added_on, last_login_at, two_factor_enabled
      FROM users
      ORDER BY added_on DESC
    `);

    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/users/:id - Get a single user
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query(`
      SELECT 
        id, unique_id, first_name, last_name, username,
        company_email, personal_email, phone_number,
        bio, gender, designation, role, status, profile_image,
        joining_date, added_on, two_factor_enabled
      FROM users WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/users - Create a new user
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const {
    firstName, lastName, username, companyEmail, personalEmail,
    phoneNumber, bio, gender, designation, role, status, joiningDate, password
  } = req.body;

  if (!firstName || !lastName || !username || !companyEmail || !password) {
    return res.status(400).json({ success: false, message: 'First name, last name, username, company email, and password are required.' });
  }

  try {
    // Check uniqueness
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR company_email = ?',
      [username, companyEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or company email is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = crypto.randomUUID();

    const [result] = await db.query(`
      INSERT INTO users (
        unique_id, first_name, last_name, username, company_email, personal_email,
        phone_number, bio, gender, designation, role, status, joining_date, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uniqueId, firstName, lastName, username, companyEmail,
      personalEmail || null, phoneNumber || null, bio || null,
      gender || 'Others', designation || null,
      role || 'Viewer', status || 'Pending',
      joiningDate || new Date().toISOString().split('T')[0],
      hashedPassword
    ]);

    return res.status(201).json({ success: true, message: 'User created successfully.', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    firstName, lastName, username, companyEmail, personalEmail,
    phoneNumber, bio, gender, designation, role, status, joiningDate
  } = req.body;

  if (!firstName || !lastName || !companyEmail) {
    return res.status(400).json({ success: false, message: 'First name, last name, and company email are required.' });
  }

  try {
    await db.query(`
      UPDATE users
      SET first_name = ?, last_name = ?, username = ?,
          company_email = ?, personal_email = ?,
          phone_number = ?, bio = ?, gender = ?,
          designation = ?, role = ?, status = ?, joining_date = ?
      WHERE id = ?
    `, [
      firstName, lastName, username, companyEmail,
      personalEmail || null, phoneNumber || null, bio || null,
      gender || 'Others', designation || null,
      role || 'Viewer', status || 'Pending',
      joiningDate || null, id
    ]);

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id - Delete a user (cannot delete self)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.userId;

  if (parseInt(id) === requestingUserId) {
    return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
  }

  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;
