const { pool } = require('../config/db');

/**
 * Admin: Get high-level dashboard overview metrics
 */
async function getDashboardOverview(req, res) {
  try {
    // 1. Total Sales / Revenue
    const [salesResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(COUNT(id), 0) as total_orders
      FROM orders
      WHERE status != 'Cancelled'
    `);

    // 2. Total Customers
    const [customersResult] = await pool.query(`
      SELECT COUNT(id) as total_customers FROM users WHERE role = 'customer'
    `);

    // 3. Total Active Products
    const [productsResult] = await pool.query(`
      SELECT COUNT(id) as total_products FROM products WHERE is_active = 1
    `);

    // 4. Low-Stock Products Count
    const [lowStockResult] = await pool.query(`
      SELECT COUNT(id) as low_stock_count FROM products 
      WHERE is_active = 1 AND stock_quantity <= low_stock_threshold
    `);

    // 5. Recent Orders (Last 5)
    const [recentOrders] = await pool.query(`
      SELECT id, order_number, customer_name, total_amount, status, payment_status, created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 6
    `);

    // 6. Low stock products sample
    const [lowStockProducts] = await pool.query(`
      SELECT id, name_en, name_ar, stock_quantity, low_stock_threshold, unit, image_url
      FROM products
      WHERE is_active = 1 AND stock_quantity <= low_stock_threshold
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);

    // 7. Orders count by status
    const [ordersByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    return res.json({
      success: true,
      stats: {
        totalSales: parseFloat(salesResult[0].total_sales || 0),
        totalOrders: parseInt(salesResult[0].total_orders || 0, 10),
        totalCustomers: parseInt(customersResult[0].total_customers || 0, 10),
        totalProducts: parseInt(productsResult[0].total_products || 0, 10),
        lowStockCount: parseInt(lowStockResult[0].low_stock_count || 0, 10)
      },
      recentOrders,
      lowStockProducts,
      ordersByStatus
    });
  } catch (error) {
    console.error('Get Dashboard Overview Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard overview.' });
  }
}

/**
 * Admin: Detailed Reports (Daily, Monthly, Best-Sellers, Category Revenue)
 */
async function getReports(req, res) {
  try {
    // 1. Daily Sales for last 14 days
    const [dailySales] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(id) as orders_count,
        COALESCE(SUM(total_amount), 0) as daily_revenue
      FROM orders
      WHERE status != 'Cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 2. Monthly Sales for current year
    const [monthlySales] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(id) as orders_count,
        COALESCE(SUM(total_amount), 0) as monthly_revenue
      FROM orders
      WHERE status != 'Cancelled'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
      LIMIT 12
    `);

    // 3. Best-Selling Products
    const [bestSelling] = await pool.query(`
      SELECT 
        oi.product_id,
        oi.product_name_en,
        oi.product_name_ar,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.total_price) as total_revenue_generated,
        p.image_url,
        p.unit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'Cancelled'
      GROUP BY oi.product_id, oi.product_name_en, oi.product_name_ar, p.image_url, p.unit
      ORDER BY total_quantity_sold DESC
      LIMIT 10
    `);

    // 4. Sales by Category
    const [categorySales] = await pool.query(`
      SELECT 
        c.id,
        c.name_en,
        c.name_ar,
        COUNT(DISTINCT o.id) as orders_count,
        COALESCE(SUM(oi.total_price), 0) as category_revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY c.id, c.name_en, c.name_ar
      ORDER BY category_revenue DESC
    `);

    // 5. Overall summary
    const [summary] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        COUNT(id) as total_orders
      FROM orders
      WHERE status != 'Cancelled'
    `);

    return res.json({
      success: true,
      summary: {
        totalRevenue: parseFloat(summary[0].total_revenue || 0),
        averageOrderValue: parseFloat(summary[0].average_order_value || 0),
        totalOrders: parseInt(summary[0].total_orders || 0, 10)
      },
      dailySales,
      monthlySales,
      bestSelling,
      categorySales
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
}

module.exports = {
  getDashboardOverview,
  getReports
};
