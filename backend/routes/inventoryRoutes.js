const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All inventory routes require admin access
router.use(authenticateToken, requireAdmin);

router.get('/', inventoryController.getInventory);
router.get('/movements', inventoryController.getStockMovements);
router.post('/adjust', inventoryController.adjustStock);

module.exports = router;
