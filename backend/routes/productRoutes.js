const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public customer routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, productController.getAdminProducts);
router.post('/', authenticateToken, requireAdmin, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

// Upload product image
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), productController.uploadProductImage);

module.exports = router;
