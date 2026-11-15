const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All reports and dashboard overview require admin access
router.use(authenticateToken, requireAdmin);

router.get('/overview', reportController.getDashboardOverview);
router.get('/analytics', reportController.getReports);

module.exports = router;
