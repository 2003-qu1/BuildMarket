const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Helper to generate JWT token
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
  }
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Register a new customer
 */
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'An account with this email address already exists.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user (default role is customer)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, phone ? phone.trim() : null, 'customer']
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      role: 'customer'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during registration. Please try again.' 
    });
  }
}

/**
 * Login user (Customer or Admin)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, phone, role, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is suspended. Please contact support.' 
      });
    }

    // Verify password securely with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again later.' 
    });
  }
}

/**
 * Get profile of currently authenticated user
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [userId]
    );

    const [orderCountResult] = await pool.query(
      'SELECT COUNT(*) as totalOrders FROM orders WHERE user_id = ?',
      [userId]
    );

    return res.json({
      success: true,
      user: {
        ...users[0],
        totalOrders: orderCountResult[0].totalOrders || 0,
        addresses
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Update current user profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, currentPassword, newPassword } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    // Check if updating password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }

      const [userRows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await pool.query(
        'UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?',
        [name.trim(), phone ? phone.trim() : null, hashedPassword, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [name.trim(), phone ? phone.trim() : null, userId]
      );
    }

    const [updated] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Add or update shipping address for user
 */
async function addAddress(req, res) {
  try {
    const userId = req.user.id;
    const { recipient_name, phone, city, district, street_address, building_number, postal_code, is_default } = req.body;

    if (!recipient_name || !phone || !city || !street_address) {
      return res.status(400).json({ success: false, message: 'Recipient name, phone, city, and street address are required.' });
    }

    if (is_default) {
      // Unset previous default
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, recipient_name, phone, city, district, street_address, building_number, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, recipient_name, phone, city, district || null, street_address, building_number || null, postal_code || null, is_default ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      addressId: result.insertId
    });
  } catch (error) {
    console.error('Add Address Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress
};
