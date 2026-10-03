const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/order');

const {
  addOrderItem,
  getOrderItems,
  updateOrderItem,
  deleteOrderItem,
} = require('../controllers/orderItem');

// Order CRUD
router.post('/', createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', getOrder);
router.patch('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, deleteOrder);

// Order items (nested under orders)
router.post('/:order_id/items', addOrderItem);
router.get('/:order_id/items', getOrderItems);
router.patch('/items/:id', authenticate, updateOrderItem);
router.delete('/items/:id', authenticate, deleteOrderItem);

module.exports = router;
