const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All customer management routes require admin access
router.use(authenticateToken, requireAdmin);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerDetails);
router.put('/:id/status', customerController.updateCustomerStatus);

module.exports = router;
