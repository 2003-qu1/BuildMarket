const { pool } = require('../config/db');

/**
 * Admin: Get all customers with spend and order metrics
 */
async function getCustomers(req, res) {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.status, 
        u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      params.push(s, s, s);
    }

    query += ` GROUP BY u.id ORDER BY u.id DESC`;

    const [customers] = await pool.query(query, params);

    return res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

/**
 * Admin: Get single customer details with order history
 */
async function getCustomerDetails(req, res) {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC',
      [id]
    );

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [id]
    );

    return res.json({
      success: true,
      customer: {
        ...users[0],
        addresses,
        orders
      }
    });
  } catch (error) {
    console.error('Get Customer Details Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
  }
}

/**
 * Admin: Update customer status (active/suspended)
 */
async function updateCustomerStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid customer status value.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ? AND role = "customer"', [status, id]);

    return res.json({
      success: true,
      message: `Customer status updated to ${status}.`
    });
  } catch (error) {
    console.error('Update Customer Status Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update customer status.' });
  }
}

module.exports = {
  getCustomers,
  getCustomerDetails,
  updateCustomerStatus
};
