const { order_items, orders, menu_items } = require('../../models');

// ─── Add Item to Order ────────────────────────────────────────────────────────

const addOrderItem = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id) {
      return res.status(400).json({ status: 'error', message: 'menu_item_id is required' });
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      return res.status(400).json({ status: 'error', message: 'Quantity must be at least 1' });
    }

    const order = await orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const menuItem = await menu_items.findByPk(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ status: 'error', message: 'Menu item not found' });
    }

    const unit_price = parseFloat(menuItem.price);

    const item = await order_items.create({
      order_id: parseInt(order_id),
      menu_item_id,
      quantity: qty,
      unit_price,
    });

    // Recalculate order total
    const allItems = await order_items.findAll({ where: { order_id } });
    const newTotal = allItems.reduce((sum, i) => sum + parseFloat(i.unit_price) * i.quantity, 0);
    await order.update({ total_price: parseFloat(newTotal.toFixed(2)) });

    const result = await order_items.findByPk(item.id, {
      include: [{ model: menu_items, as: 'menuItem', attributes: ['id', 'name', 'price'] }],
    });

    return res.status(201).json({
      status: 'success',
      message: 'Item added to order',
      data: result,
    });
  } catch (error) {
    console.error('Add order item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Get Items for an Order ───────────────────────────────────────────────────

const getOrderItems = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const items = await order_items.findAll({
      where: { order_id },
      include: [{ model: menu_items, as: 'menuItem' }],
    });

    return res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    console.error('Get order items error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Update Order Item ────────────────────────────────────────────────────────

const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await order_items.findByPk(id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Order item not found' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ status: 'error', message: 'Quantity must be at least 1' });
    }

    await item.update({ quantity: qty });

    // Recalculate order total
    const order = await orders.findByPk(item.order_id);
    const allItems = await order_items.findAll({ where: { order_id: item.order_id } });
    const newTotal = allItems.reduce((sum, i) => sum + parseFloat(i.unit_price) * i.quantity, 0);
    await order.update({ total_price: parseFloat(newTotal.toFixed(2)) });

    return res.status(200).json({
      status: 'success',
      message: 'Order item updated',
      data: item,
    });
  } catch (error) {
    console.error('Update order item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ─── Delete Order Item ────────────────────────────────────────────────────────

const deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await order_items.findByPk(id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Order item not found' });
    }

    const { order_id } = item;
    await item.destroy();

    // Recalculate order total
    const order = await orders.findByPk(order_id);
    if (order) {
      const allItems = await order_items.findAll({ where: { order_id } });
      const newTotal = allItems.reduce((sum, i) => sum + parseFloat(i.unit_price) * i.quantity, 0);
      await order.update({ total_price: parseFloat(newTotal.toFixed(2)) });
    }

    return res.status(200).json({ status: 'success', message: 'Order item removed' });
  } catch (error) {
    console.error('Delete order item error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = {
  addOrderItem,
  getOrderItems,
  updateOrderItem,
  deleteOrderItem,
};
