const path = require('path');
const { pool } = require('../config/db');
const { getImageKit } = require('../config/imagekit');

/**
 * Get all products with filters, search, and sorting
 */
async function getProducts(req, res) {
  try {
    const {
      category,
      search,
      sort,
      featured,
      minPrice,
      maxPrice,
      limit,
      offset
    } = req.query;

    let query = `
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    // Filter by category slug or category_id
    if (category && category !== 'all') {
      if (isNaN(category)) {
        query += ` AND c.slug = ?`;
      } else {
        query += ` AND p.category_id = ?`;
      }
      params.push(category);
    }

    // Search query in English & Arabic (name, description, sku, brand)
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        p.name_en LIKE ? OR 
        p.name_ar LIKE ? OR 
        p.description_en LIKE ? OR 
        p.description_ar LIKE ? OR 
        p.sku LIKE ? OR 
        p.brand LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filter by featured
    if (featured === 'true' || featured === '1') {
      query += ` AND p.is_featured = 1`;
    }

    // Filter by price range
    if (minPrice && !isNaN(minPrice)) {
      query += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      query += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        query += ` ORDER BY COALESCE(p.sale_price, p.price) ASC`;
        break;
      case 'price-desc':
        query += ` ORDER BY COALESCE(p.sale_price, p.price) DESC`;
        break;
      case 'name-asc':
        query += ` ORDER BY p.name_en ASC`;
        break;
      case 'name-desc':
        query += ` ORDER BY p.name_en DESC`;
        break;
      case 'stock':
        query += ` ORDER BY p.stock_quantity DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.id DESC`;
        break;
    }

    // Pagination
    if (limit && !isNaN(limit)) {
      const limitVal = parseInt(limit, 10);
      const offsetVal = offset && !isNaN(offset) ? parseInt(offset, 10) : 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limitVal, offsetVal);
    }

    const [products] = await pool.query(query, params);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

/**
 * Get single product by ID
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const [products] = await pool.query(`
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get related products from same category
    const [relatedProducts] = await pool.query(`
      SELECT id, name_en, name_ar, price, sale_price, image_url, unit, stock_quantity
      FROM products
      WHERE category_id = ? AND id != ? AND is_active = 1
      LIMIT 4
    `, [products[0].category_id, id]);

    return res.json({
      success: true,
      product: products[0],
      relatedProducts
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

/**
 * Admin: Get all products including inactive & low-stock
 */
async function getAdminProducts(req, res) {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Admin Get Products Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin products.' });
  }
}

/**
 * Admin: Create a new product
 */
async function createProduct(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      category_id,
      sku,
      name_en,
      name_ar,
      description_en,
      description_ar,
      price,
      sale_price,
      stock_quantity,
      low_stock_threshold,
      unit,
      image_url,
      is_featured,
      is_active,
      brand,
      weight
    } = req.body;

    if (!category_id || !name_en || !name_ar || price === undefined) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Category, English name, Arabic name, and Price are required.'
      });
    }

    // Generate SKU if omitted
    const finalSku = sku && sku.trim() !== ''
      ? sku.trim().toUpperCase()
      : 'BM-' + Date.now().toString().slice(-6);

    const [existing] = await connection.query('SELECT id FROM products WHERE sku = ?', [finalSku]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A product with this SKU already exists.' });
    }

    const stock = parseInt(stock_quantity || '0', 10);

    const [result] = await connection.query(`
      INSERT INTO products (
        category_id, sku, name_en, name_ar, description_en, description_ar,
        price, sale_price, stock_quantity, low_stock_threshold, unit,
        image_url, is_featured, is_active, brand, weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category_id,
      finalSku,
      name_en.trim(),
      name_ar.trim(),
      description_en || null,
      description_ar || null,
      parseFloat(price),
      sale_price ? parseFloat(sale_price) : null,
      stock,
      low_stock_threshold ? parseInt(low_stock_threshold, 10) : 10,
      unit || 'Piece',
      image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      is_featured ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      brand || null,
      weight ? parseFloat(weight) : null
    ]);

    const newProductId = result.insertId;

    // Log initial inventory
    await connection.query(`
      INSERT INTO inventory (product_id, change_type, quantity_change, previous_stock, new_stock, notes)
      VALUES (?, 'initial', ?, 0, ?, 'Product created by admin')
    `, [newProductId, stock, stock]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      productId: newProductId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  } finally {
    connection.release();
  }
}

/**
 * Admin: Update product
 */
async function updateProduct(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      category_id,
      sku,
      name_en,
      name_ar,
      description_en,
      description_ar,
      price,
      sale_price,
      stock_quantity,
      low_stock_threshold,
      unit,
      image_url,
      is_featured,
      is_active,
      brand,
      weight
    } = req.body;

    const [currentRows] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const currentProduct = currentRows[0];
    const newStock = stock_quantity !== undefined ? parseInt(stock_quantity, 10) : currentProduct.stock_quantity;

    await connection.query(`
      UPDATE products SET
        category_id = ?,
        sku = ?,
        name_en = ?,
        name_ar = ?,
        description_en = ?,
        description_ar = ?,
        price = ?,
        sale_price = ?,
        stock_quantity = ?,
        low_stock_threshold = ?,
        unit = ?,
        image_url = ?,
        is_featured = ?,
        is_active = ?,
        brand = ?,
        weight = ?
      WHERE id = ?
    `, [
      category_id || currentProduct.category_id,
      sku || currentProduct.sku,
      name_en || currentProduct.name_en,
      name_ar || currentProduct.name_ar,
      description_en !== undefined ? description_en : currentProduct.description_en,
      description_ar !== undefined ? description_ar : currentProduct.description_ar,
      price !== undefined ? parseFloat(price) : currentProduct.price,
      sale_price !== undefined ? (sale_price ? parseFloat(sale_price) : null) : currentProduct.sale_price,
      newStock,
      low_stock_threshold !== undefined ? parseInt(low_stock_threshold, 10) : currentProduct.low_stock_threshold,
      unit || currentProduct.unit,
      image_url || currentProduct.image_url,
      is_featured !== undefined ? (is_featured ? 1 : 0) : currentProduct.is_featured,
      is_active !== undefined ? (is_active ? 1 : 0) : currentProduct.is_active,
      brand !== undefined ? brand : currentProduct.brand,
      weight !== undefined ? (weight ? parseFloat(weight) : null) : currentProduct.weight,
      id
    ]);

    // If stock changed, write inventory adjustment record
    if (newStock !== currentProduct.stock_quantity) {
      const diff = newStock - currentProduct.stock_quantity;
      await connection.query(`
        INSERT INTO inventory (product_id, change_type, quantity_change, previous_stock, new_stock, notes)
        VALUES (?, 'adjustment', ?, ?, ?, 'Admin manual stock update')
      `, [id, diff, currentProduct.stock_quantity, newStock]);
    }

    await connection.commit();

    return res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  } finally {
    connection.release();
  }
}

/**
 * Admin: Delete product
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product is in any orders
    const [orderItems] = await pool.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);

    if (orderItems.length > 0) {
      // Deactivate instead of deleting to maintain historical orders integrity
      await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Product is referenced in existing orders. It has been deactivated instead of deleted.'
      });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Product deleted permanently.' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}

/**
 * Admin: Upload product image file to ImageKit cloud media storage
 */
async function uploadProductImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }

  const imagekit = getImageKit();
  if (!imagekit) {
    return res.status(500).json({
      success: false,
      message: 'ImageKit is not configured. Please ensure IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY are set in backend/.env'
    });
  }

  try {
    const ext = path.extname(req.file.originalname) || '.jpg';
    const cleanBaseName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `product-${cleanBaseName}-${Date.now()}${ext}`;

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // Buffer stream from multer memoryStorage
      fileName: fileName,
      folder: '/buildmarket/products',
      useUniqueFileName: true
    });

    return res.json({
      success: true,
      message: 'Image uploaded successfully to ImageKit.',
      imageUrl: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name
    });
  } catch (error) {
    console.error('ImageKit Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to upload image to ImageKit: ${error.message || 'Unknown error'}`
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
