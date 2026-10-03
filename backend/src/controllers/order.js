const { orders, order_items, menu_items, categories, users } = require('../../models');

// ─── Create Order ─────────────────────────────────────────────────────────────
// Body: { user_id?, notes?, items: [{ menu_item_id, quantity }] }

const createOrder = async (req, res) => {
  try {
    const { user_id, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Order must contain at least one item',
      });
    }

    // Validate each item and compute total
    let total_price = 0;
    const resolvedItems = [];

    for (const item of items) {
      if (!item.menu_item_id) {
        return res.status(400).json({ status: 'error', message: 'Each item must have a menu_item_id' });
      }
      const qty = parseInt(item.quantity) || 1;
      if (qty < 1) {
        return res.status(400).json({ status: 'error', message: 'Quantity must be at least 1' });
      }

      const menuItem = await menu_items.findByPk(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({
          status: 'error',
          message: `Menu item with id ${item.menu_item_id} not found`,
        });
      }
      if (!menuItem.is_available) {
        return res.status(400).json({
          status: 'error',
          message: `Menu item "${menuItem.name}" is not available`,
        });
      }

      const unit_price = parseFloat(menuItem.price);
      total_price += unit_price * qty;
      resolvedItems.push({ menu_item_id: item.menu_item_id, quantity: qty, unit_price });
    }

    // Validate user if provided
    if (user_id) {
      const user = await users.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
    }

    // Create the order
    const order = await orders.create({
      user_id: user_id || null,
      status: 'pending',
      total_price: parseFloat(total_price.toFixed(2)),
      notes: notes || null,
    });

    // Create order items
    const orderItemsData = resolvedItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    await order_items.bulkCreate(orderItemsData);

    // Return full order with items
    const result = await orders.findByPk(order.id, {
      include: [
        {
          model: order_items,
          as: 'orderItems',
          include: [{ model: menu_items, as: 'menuItem', attributes: ['id', 'name', 'price'] }],
        },
        { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get All Orders ───────────────────────────────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const allOrders = await orders.findAll({
      include: [
        {
          model: order_items,
          as: 'orderItems',
          include: [{ model: menu_items, as: 'menuItem', attributes: ['id', 'name', 'price'] }],
        },
        { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ status: 'success', data: allOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get Single Order ─────────────────────────────────────────────────────────

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orders.findByPk(id, {
      include: [
        {
          model: order_items,
          as: 'orderItems',
          include: [
            {
              model: menu_items,
              as: 'menuItem',
              include: [{ model: categories, as: 'category', attributes: ['id', 'name'] }],
            },
          ],
        },
        { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    return res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Update Order ─────────────────────────────────────────────────────────────

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await orders.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await order.update({
      status: status || order.status,
      notes: notes !== undefined ? notes : order.notes,
    });

    const result = await orders.findByPk(id, {
      include: [
        {
          model: order_items,
          as: 'orderItems',
          include: [{ model: menu_items, as: 'menuItem', attributes: ['id', 'name', 'price'] }],
        },
        { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Delete Order ─────────────────────────────────────────────────────────────

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orders.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    // order_items will cascade delete due to the FK constraint
    await order.destroy();

    return res.status(200).json({ status: 'success', message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};
