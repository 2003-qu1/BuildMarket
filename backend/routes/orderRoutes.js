const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Create order (Customer or guest with optional token)
router.post('/', optionalAuth, orderController.createOrder);

// Customer order history
router.get('/my-orders', authenticateToken, orderController.getMyOrders);

// Order details by id / order_number (Customer own order or Admin)
router.get('/:id', authenticateToken, orderController.getOrderDetails);

// Admin order routes
router.get('/admin/all', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
