const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const verifyToken = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// GET /api/users - List all users with pagination and filtering
router.get('/', verifyToken, requirePermission('users', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const { search, role, status, sortBy, sortOrder } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ? OR username LIKE ? OR company_email LIKE ? OR personal_email LIKE ? OR designation LIKE ? OR phone_number LIKE ? OR gender LIKE ?)';
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (role && role !== 'All') {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }

    if (status && status !== 'All') {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, queryParams);

    const sortColumns = {
      'user': 'first_name',
      'company_email': 'company_email',
      'personal_email': 'personal_email',
      'phone_number': 'phone_number',
      'role': 'role',
      'status': 'status',
      'joined_on': 'joining_date'
    };
    const dbSortColumn = sortColumns[sortBy] || 'added_on';
    const dbSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [users] = await db.query(`
      SELECT 
        id, unique_id, first_name, last_name, username,
        company_email, personal_email, phone_number,
        gender, designation, role, status, profile_image,
        joining_date, added_on, last_login_at, two_factor_enabled
      FROM users
      ${whereClause}
      ORDER BY ${dbSortColumn} ${dbSortOrder}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    return res.json({ success: true, users, total, page, limit });
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/users/modules - List available modules for permissions assignment
router.get('/modules', verifyToken, requirePermission('users', 'read'), async (req, res) => {
  try {
    const [modules] = await db.query('SELECT module_key, module_name, category FROM modules ORDER BY category, module_name');
    return res.json({ success: true, modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/users/:id - Get user details
router.get('/:id', verifyToken, requirePermission('users', 'read'), async (req, res) => {
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

    // Fetch user permissions
    const [permRows] = await db.query(`
      SELECT module_key, can_read, can_create, can_update, can_delete
      FROM user_module_permissions WHERE user_id = ?
    `, [id]);

    const permissions = {};
    permRows.forEach(r => {
      permissions[r.module_key] = {
        read: Boolean(r.can_read),
        create: Boolean(r.can_create),
        update: Boolean(r.can_update),
        delete: Boolean(r.can_delete)
      };
    });

    const user = users[0];
    user.permissions = permissions;

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/users - Create new user
router.post('/', verifyToken, requirePermission('users', 'create'), [
  body('firstName').trim().notEmpty().withMessage('First name is required.').escape(),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').escape(),
  body('username').trim().notEmpty().withMessage('Username is required.').escape(),
  body('companyEmail').trim().isEmail().normalizeEmail().withMessage('Valid company email is required.'),
  body('personalEmail').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail().withMessage('Valid personal email is required.'),
  body('phoneNumber').optional({ checkFalsy: true }).trim().escape(),
  body('role').isIn(['Super Admin', 'Admin', 'Editor', 'Viewer']).withMessage('Invalid role.'),
  body('status').isIn(['Active', 'Inactive', 'Suspended', 'Pending']).withMessage('Invalid status.'),
  body('password')
    .trim()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage('Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.'),
  body('bio').optional({ checkFalsy: true }).trim().escape(),
  body('designation').optional({ checkFalsy: true }).trim().escape()
], validate, async (req, res) => {
  const {
    firstName, lastName, username, companyEmail, personalEmail,
    phoneNumber, bio, gender, designation, role, status, joiningDate, password, permissions
  } = req.body;

  // Prevent Privilege Escalation
  if (role === 'Super Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Super Admins can assign the Super Admin role.' });
  }

  try {
    // Validate that requester is not granting permissions they don't have (unless Super Admin)
    if (req.user.role !== 'Super Admin' && permissions && typeof permissions === 'object') {
      const [reqPermRows] = await db.query('SELECT module_key, can_read, can_create, can_update, can_delete FROM user_module_permissions WHERE user_id = ?', [req.user.userId]);
      const requesterPerms = {};
      reqPermRows.forEach(r => {
        requesterPerms[r.module_key] = {
          read: Boolean(r.can_read), create: Boolean(r.can_create),
          update: Boolean(r.can_update), delete: Boolean(r.can_delete)
        };
      });

      for (const [modKey, acts] of Object.entries(permissions)) {
        const reqMod = requesterPerms[modKey] || { read: false, create: false, update: false, delete: false };
        if ((acts.read && !reqMod.read) || (acts.create && !reqMod.create) || (acts.update && !reqMod.update) || (acts.delete && !reqMod.delete)) {
           return res.status(403).json({ success: false, message: `You cannot grant permissions you do not possess for module: ${modKey}` });
        }
      }
    }

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

    const userId = result.insertId;

    if (permissions && typeof permissions === 'object') {
      const permsArray = [];
      for (const [moduleKey, actions] of Object.entries(permissions)) {
        permsArray.push([
          userId, moduleKey,
          actions.read ? 1 : 0, actions.create ? 1 : 0,
          actions.update ? 1 : 0, actions.delete ? 1 : 0
        ]);
      }
      if (permsArray.length > 0) {
        await db.query(`
          INSERT INTO user_module_permissions 
          (user_id, module_key, can_read, can_create, can_update, can_delete) 
          VALUES ?
        `, [permsArray]);
      }
    }

    return res.status(201).json({ success: true, message: 'User created successfully.', userId });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', verifyToken, requirePermission('users', 'update'), [
  body('firstName').trim().notEmpty().withMessage('First name is required.').escape(),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').escape(),
  body('username').trim().notEmpty().withMessage('Username is required.').escape(),
  body('companyEmail').trim().isEmail().normalizeEmail().withMessage('Valid company email is required.'),
  body('personalEmail').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail().withMessage('Valid personal email is required.'),
  body('phoneNumber').optional({ checkFalsy: true }).trim().escape(),
  body('role').isIn(['Super Admin', 'Admin', 'Editor', 'Viewer']).withMessage('Invalid role.'),
  body('status').isIn(['Active', 'Inactive', 'Suspended', 'Pending']).withMessage('Invalid status.'),
  body('bio').optional({ checkFalsy: true }).trim().escape(),
  body('designation').optional({ checkFalsy: true }).trim().escape()
], validate, async (req, res) => {
  const { id } = req.params;
  const {
    firstName, lastName, username, companyEmail, personalEmail,
    phoneNumber, bio, gender, designation, role, status, joiningDate, permissions
  } = req.body;

  try {
    // Check uniqueness (exclude self)
    if (username) {
       const [existing] = await db.query(
         'SELECT id FROM users WHERE (username = ? OR company_email = ?) AND id != ?',
         [username, companyEmail, id]
       );
       if (existing.length > 0) {
         return res.status(409).json({ success: false, message: 'Username or company email is already taken by another user.' });
       }
    }

    // Privilege Escalation check: Role and Permissions
    const [targetUserRows] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (targetUserRows.length > 0) {
      if ((targetUserRows[0].role === 'Super Admin' || role === 'Super Admin') && req.user.role !== 'Super Admin') {
        return res.status(403).json({ success: false, message: 'Only Super Admins can manage Super Admin accounts or assign the Super Admin role.' });
      }
    }

    if (req.user.role !== 'Super Admin' && permissions && typeof permissions === 'object') {
      const [reqPermRows] = await db.query('SELECT module_key, can_read, can_create, can_update, can_delete FROM user_module_permissions WHERE user_id = ?', [req.user.userId]);
      const requesterPerms = {};
      reqPermRows.forEach(r => {
        requesterPerms[r.module_key] = {
          read: Boolean(r.can_read), create: Boolean(r.can_create),
          update: Boolean(r.can_update), delete: Boolean(r.can_delete)
        };
      });

      for (const [modKey, acts] of Object.entries(permissions)) {
        const reqMod = requesterPerms[modKey] || { read: false, create: false, update: false, delete: false };
        if ((acts.read && !reqMod.read) || (acts.create && !reqMod.create) || (acts.update && !reqMod.update) || (acts.delete && !reqMod.delete)) {
           return res.status(403).json({ success: false, message: `You cannot grant permissions you do not possess for module: ${modKey}` });
        }
      }
    }

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

    if (permissions && typeof permissions === 'object') {
      await db.query('DELETE FROM user_module_permissions WHERE user_id = ?', [id]);
      const permsArray = [];
      for (const [moduleKey, actions] of Object.entries(permissions)) {
        permsArray.push([
          id, moduleKey,
          actions.read ? 1 : 0, actions.create ? 1 : 0,
          actions.update ? 1 : 0, actions.delete ? 1 : 0
        ]);
      }
      if (permsArray.length > 0) {
        await db.query(`
          INSERT INTO user_module_permissions 
          (user_id, module_key, can_read, can_create, can_update, can_delete) 
          VALUES ?
        `, [permsArray]);
      }
    }

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id - Delete a user (cannot delete self)
router.delete('/:id', verifyToken, requirePermission('users', 'delete'), async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.userId;

  if (parseInt(id) === requestingUserId) {
    return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
  }

  try {
    // Privilege Escalation check: Prevent deleting Super Admins
    const [targetUserRows] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (targetUserRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (targetUserRows[0].role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Super Admin accounts cannot be deleted.' });
    }

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
