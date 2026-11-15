const { pool } = require('../config/db');

/**
 * Admin: Get all inventory items with stock indicators
 */
async function getInventory(req, res) {
  try {
    const { lowStockOnly, search } = req.query;

    let query = `
      SELECT 
        p.id, 
        p.sku, 
        p.name_en, 
        p.name_ar, 
        p.unit, 
        p.stock_quantity, 
        p.low_stock_threshold,
        p.price,
        p.image_url,
        c.name_en as category_name_en,
        c.name_ar as category_name_ar,
        (p.stock_quantity <= p.low_stock_threshold) as is_low_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (lowStockOnly === 'true' || lowStockOnly === '1') {
      query += ` AND p.stock_quantity <= p.low_stock_threshold`;
    }

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      query += ` AND (p.name_en LIKE ? OR p.name_ar LIKE ? OR p.sku LIKE ?)`;
      params.push(s, s, s);
    }

    query += ` ORDER BY is_low_stock DESC, p.stock_quantity ASC`;

    const [items] = await pool.query(query, params);

    return res.json({
      success: true,
      count: items.length,
      inventory: items
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory data.' });
  }
}

/**
 * Admin: Get recent inventory movement logs
 */
async function getStockMovements(req, res) {
  try {
    const { productId, limit } = req.query;

    let query = `
      SELECT 
        i.*,
        p.sku,
        p.name_en,
        p.name_ar,
        p.unit,
        o.order_number
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN orders o ON i.reference_order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (productId) {
      query += ` AND i.product_id = ?`;
      params.push(productId);
    }

    query += ` ORDER BY i.id DESC LIMIT ?`;
    params.push(parseInt(limit || '50', 10));

    const [movements] = await pool.query(query, params);

    return res.json({
      success: true,
      movements
    });
  } catch (error) {
    console.error('Get Stock Movements Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory logs.' });
  }
}

/**
 * Admin: Adjust stock quantity manually
 */
async function adjustStock(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { productId, adjustmentQuantity, reason } = req.body;

    if (!productId || adjustmentQuantity === undefined) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Product ID and adjustment quantity are required.' });
    }

    const qty = parseInt(adjustmentQuantity, 10);
    if (isNaN(qty) || qty === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Adjustment quantity must be a non-zero number.' });
    }

    const [prods] = await connection.query('SELECT id, stock_quantity, name_en FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (prods.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const currentStock = prods[0].stock_quantity;
    const newStock = currentStock + qty;

    if (newStock < 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Adjustment would result in negative stock (${newStock}). Current available is ${currentStock}.` 
      });
    }

    await connection.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, productId]);

    await connection.query(`
      INSERT INTO inventory (product_id, change_type, quantity_change, previous_stock, new_stock, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      productId,
      qty > 0 ? 'restock' : 'adjustment',
      qty,
      currentStock,
      newStock,
      reason || (qty > 0 ? 'Manual restock' : 'Manual stock deduction')
    ]);

    await connection.commit();

    return res.json({
      success: true,
      message: 'Stock updated successfully.',
      previous_stock: currentStock,
      new_stock: newStock
    });
  } catch (error) {
    await connection.rollback();
    console.error('Adjust Stock Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to adjust stock.' });
  } finally {
    connection.release();
  }
}

module.exports = {
  getInventory,
  getStockMovements,
  adjustStock
};
