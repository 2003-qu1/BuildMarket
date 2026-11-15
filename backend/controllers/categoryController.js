const { pool } = require('../config/db');

/**
 * Get all active categories with product counts
 */
async function getCategories(req, res) {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

/**
 * Admin: Get all categories (including inactive)
 */
async function getAdminCategories(req, res) {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Admin Get Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin categories.' });
  }
}

/**
 * Admin: Create category
 */
async function createCategory(req, res) {
  try {
    const { name_en, name_ar, slug, description_en, description_ar, image_url, display_order } = req.body;

    if (!name_en || !name_ar) {
      return res.status(400).json({ success: false, message: 'English and Arabic names are required.' });
    }

    const finalSlug = slug && slug.trim() !== '' 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      : name_en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A category with this slug already exists.' });
    }

    const [result] = await pool.query(`
      INSERT INTO categories (slug, name_en, name_ar, description_en, description_ar, image_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      finalSlug,
      name_en.trim(),
      name_ar.trim(),
      description_en || null,
      description_ar || null,
      image_url || null,
      display_order ? parseInt(display_order, 10) : 0
    ]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

/**
 * Admin: Update category
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name_en, name_ar, slug, description_en, description_ar, image_url, display_order, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const cat = existing[0];

    await pool.query(`
      UPDATE categories SET
        name_en = ?,
        name_ar = ?,
        slug = ?,
        description_en = ?,
        description_ar = ?,
        image_url = ?,
        display_order = ?,
        is_active = ?
      WHERE id = ?
    `, [
      name_en !== undefined ? name_en.trim() : cat.name_en,
      name_ar !== undefined ? name_ar.trim() : cat.name_ar,
      slug !== undefined ? slug.trim().toLowerCase() : cat.slug,
      description_en !== undefined ? description_en : cat.description_en,
      description_ar !== undefined ? description_ar : cat.description_ar,
      image_url !== undefined ? image_url : cat.image_url,
      display_order !== undefined ? parseInt(display_order, 10) : cat.display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : cat.is_active,
      id
    ]);

    return res.json({
      success: true,
      message: 'Category updated successfully.'
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

/**
 * Admin: Delete category
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if category has products
    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category containing products. Reassign or delete products first.'
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
}

module.exports = {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
