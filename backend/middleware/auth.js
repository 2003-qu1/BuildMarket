const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Middleware to authenticate JWT token
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No authentication token provided.' 
    });
  }

  // Validate JWT_SECRET exists in environment
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication configuration error.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch active user from database
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
      [decoded.userId || decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token: User no longer exists.' 
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is suspended or inactive.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
}

/**
 * Middleware to restrict route to administrators only
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access restricted to administrators only.' 
    });
  }
  next();
}

/**
 * Optional authentication: attaches user if token is present, continues otherwise
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  // If JWT_SECRET is not configured, treat user as guest
  if (!process.env.JWT_SECRET) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
      [decoded.userId || decoded.id]
    );
    req.user = rows.length > 0 ? rows[0] : null;
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
