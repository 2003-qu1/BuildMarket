const { pool } = require('../config/db');

/**
 * Submit / Place a new purchase order
 */
async function createOrder(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      notes,
      payment_method,
      items
    } = req.body;

    // Validation
    if (!customer_name || !customer_phone || !shipping_address || !city) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, phone, delivery address, and city are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Your shopping cart is empty.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const email = customer_email ? customer_email.trim() : (req.user ? req.user.email : 'guest@buildmarket.com');

    // Verify products and calculate total from actual database prices
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, name_en, name_ar, price, sale_price, stock_quantity, unit FROM products WHERE id = ? AND is_active = 1 FOR UPDATE',
        [item.id || item.product_id]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.id} is no longer available.`
        });
      }

      const product = productRows[0];
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${product.name_en}.`
        });
      }

      if (product.stock_quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name_en}". Available: ${product.stock_quantity}, Requested: ${quantity}`
        });
      }

      const unitPrice = product.sale_price !== null ? parseFloat(product.sale_price) : parseFloat(product.price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        product,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    // Delivery fee and tax calculation
    const deliveryFee = subtotal > 1000 ? 0.00 : 50.00; // Free delivery for orders above 1000
    const tax = 0.00; // Tax included or standard
    const totalAmount = subtotal + deliveryFee + tax;

    // Generate readable order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BM-${dateStr}-${randomSuffix}`;

    const method = payment_method || 'Cash on Delivery';

    // Insert Order
    const [orderResult] = await connection.query(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, notes, subtotal, delivery_fee, tax, total_amount,
        status, payment_method, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, 'Pending')
    `, [
      orderNumber,
      userId,
      customer_name.trim(),
      email,
      customer_phone.trim(),
      shipping_address.trim(),
      city.trim(),
      notes ? notes.trim() : null,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      method
    ]);

    const orderId = orderResult.insertId;

    // Insert Order Items and Update Inventory
    for (const verified of verifiedItems) {
      await connection.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name_en, product_name_ar, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        verified.product.id,
        verified.product.name_en,
        verified.product.name_ar,
        verified.unitPrice,
        verified.quantity,
        verified.lineTotal
      ]);

      // Deduct stock
      const previousStock = verified.product.stock_quantity;
      const newStock = previousStock - verified.quantity;

      await connection.query(
        'UPDATE products SET stock_quantity = ? WHERE id = ?',
        [newStock, verified.product.id]
      );

      // Record in inventory audit log
      await connection.query(`
        INSERT INTO inventory (product_id, change_type, quantity_change, previous_stock, new_stock, reference_order_id, notes)
        VALUES (?, 'order_deduct', ?, ?, ?, ?, ?)
      `, [
        verified.product.id,
        -verified.quantity,
        previousStock,
        newStock,
        orderId,
        `Stock deducted for Order #${orderNumber}`
      ]);
    }

    // Insert Initial Payment Record
    await connection.query(`
      INSERT INTO payments (order_id, payment_method, amount, status)
      VALUES (?, ?, ?, 'Pending')
    `, [orderId, method, totalAmount]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: 'Pending',
        payment_method: method
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process order. Please try again.' });
  } finally {
    connection.release();
  }
}

/**
 * Get orders for currently logged in customer
 */
async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(`
      SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.id DESC
    `, [userId]);

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your orders.' });
  }
}

/**
 * Get detailed single order by ID or order_number
 * Access Control:
 * - Unauthenticated users: 401 Unauthorized
 * - Authenticated customers: 200 OK only for their own orders; 403 Forbidden for other customers' orders
 * - Administrators: 200 OK for any order
 */
async function getOrderDetails(req, res) {
  try {
    const { id } = req.params;

    // 1. Enforce authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to view order details.'
      });
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 2. Fetch the order record
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // 3. Authorization check (IDOR Protection)
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.'
      });
    }

    // 4. Fetch associated items and payments for authorized user
    const [items] = await pool.query(`
      SELECT oi.*, p.image_url, p.unit, p.sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);

    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC',
      [order.id]
    );

    return res.json({
      success: true,
      order: {
        ...order,
        items,
        payments
      }
    });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
}

/**
 * Admin: Get all orders with filtering and search
 */
async function getAllOrders(req, res) {
  try {
    const { status, search, limit, offset } = req.query;

    let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_email LIKE ?)`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY o.id DESC`;

    if (limit && !isNaN(limit)) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit, 10), parseInt(offset || '0', 10));
    }

    const [orders] = await pool.query(query, params);

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Admin Get All Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
}

/**
 * Admin: Update order status & payment status
 */
async function updateOrderStatus(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status, payment_status, notes } = req.body;

    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentOrder = orderRows[0];
    const prevStatus = currentOrder.status;

    // Handle cancellation restock if previously not cancelled
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        const [prod] = await connection.query('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
        if (prod.length > 0) {
          const prevStock = prod[0].stock_quantity;
          const newStock = prevStock + item.quantity;
          await connection.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);

          await connection.query(`
            INSERT INTO inventory (product_id, change_type, quantity_change, previous_stock, new_stock, reference_order_id, notes)
            VALUES (?, 'order_cancel_restock', ?, ?, ?, ?, ?)
          `, [item.product_id, item.quantity, prevStock, newStock, id, `Restocked due to Order #${currentOrder.order_number} cancellation`]);
        }
      }
    }

    await connection.query(`
      UPDATE orders SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = NOW()
      WHERE id = ?
    `, [status || null, payment_status || null, notes || null, id]);

    // If payment_status is updated to Paid, update payments table too
    if (payment_status) {
      await connection.query(
        'UPDATE payments SET status = ? WHERE order_id = ?',
        [payment_status === 'Paid' ? 'Completed' : payment_status, id]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: 'Order updated successfully.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update Order Status Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order.' });
  } finally {
    connection.release();
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus
};
