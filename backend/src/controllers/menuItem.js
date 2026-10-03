const { menu_items, categories } = require('../../models');

// ─── Create Menu Item ─────────────────────────────────────────────────────────

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category_id, is_available } = req.body;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Menu item name is required' });
    }
    if (price === undefined || price === null) {
      return res.status(400).json({ status: 'error', message: 'Price is required' });
    }
    if (!category_id) {
      return res.status(400).json({ status: 'error', message: 'category_id is required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ status: 'error', message: 'Price must be a non-negative number' });
    }

    // Verify category exists
    const category = await categories.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Check name uniqueness
    const existing = await menu_items.findOne({ where: { name: String(name).trim() } });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Menu item name already exists' });
    }

    const item = await menu_items.create({
      name: String(name).trim(),
      description: description || null,
      price: parsedPrice,
      category_id,
      is_available: is_available !== undefined ? is_available : true,
    });

    // Return with category info
    const result = await menu_items.findByPk(item.id, {
      include: [{ model: categories, as: 'category', attributes: ['id', 'name'] }],
    });

    return res.status(201).json({
      status: 'success',
      message: 'Menu item created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get All Menu Items ───────────────────────────────────────────────────────

const getMenuItems = async (req, res) => {
  try {
    const { category_id } = req.query;

    const where = {};
    if (category_id) where.category_id = category_id;

    const items = await menu_items.findAll({
      where,
      include: [{ model: categories, as: 'category', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    console.error('Get menu items error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get Single Menu Item ─────────────────────────────────────────────────────

const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await menu_items.findByPk(id, {
      include: [{ model: categories, as: 'category' }],
    });

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Menu item not found' });
    }

    return res.status(200).json({ status: 'success', data: item });
  } catch (error) {
    console.error('Get menu item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Update Menu Item ─────────────────────────────────────────────────────────

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, is_available } = req.body;

    const item = await menu_items.findByPk(id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Menu item not found' });
    }

    // Validate price if provided
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ status: 'error', message: 'Price must be a non-negative number' });
      }
    }

    // Validate category if provided
    if (category_id) {
      const category = await categories.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ status: 'error', message: 'Category not found' });
      }
    }

    // Check name uniqueness
    if (name && String(name).trim() !== item.name) {
      const existing = await menu_items.findOne({ where: { name: String(name).trim() } });
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'Menu item name already exists' });
      }
    }

    await item.update({
      name: name ? String(name).trim() : item.name,
      description: description !== undefined ? description : item.description,
      price: price !== undefined ? parseFloat(price) : item.price,
      category_id: category_id || item.category_id,
      is_available: is_available !== undefined ? is_available : item.is_available,
    });

    const result = await menu_items.findByPk(item.id, {
      include: [{ model: categories, as: 'category', attributes: ['id', 'name'] }],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Menu item updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Delete Menu Item ─────────────────────────────────────────────────────────

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await menu_items.findByPk(id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Menu item not found' });
    }

    await item.destroy();

    return res.status(200).json({ status: 'success', message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
