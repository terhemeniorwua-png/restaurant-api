const { categories, menu_items } = require('../../models');

// ─── Create Category ──────────────────────────────────────────────────────────

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Category name is required',
      });
    }

    const existing = await categories.findOne({ where: { name: String(name).trim() } });
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Category name already exists',
      });
    }

    const category = await categories.create({
      name: String(name).trim(),
      description: description || null,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get All Categories ───────────────────────────────────────────────────────

const getCategories = async (req, res) => {
  try {
    const allCategories = await categories.findAll({
      include: [{ model: menu_items, as: 'menuItems', attributes: ['id', 'name', 'price', 'is_available'] }],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      status: 'success',
      data: allCategories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get Single Category ──────────────────────────────────────────────────────

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categories.findByPk(id, {
      include: [{ model: menu_items, as: 'menuItems' }],
    });

    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    return res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Update Category ──────────────────────────────────────────────────────────

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    if (name && String(name).trim() !== category.name) {
      const existing = await categories.findOne({ where: { name: String(name).trim() } });
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'Category name already exists' });
      }
    }

    await category.update({
      name: name ? String(name).trim() : category.name,
      description: description !== undefined ? description : category.description,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Delete Category ──────────────────────────────────────────────────────────

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Check if any menu items reference this category
    const itemCount = await menu_items.count({ where: { category_id: id } });
    if (itemCount > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Cannot delete category: ${itemCount} menu item(s) are assigned to it`,
      });
    }

    await category.destroy();

    return res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
