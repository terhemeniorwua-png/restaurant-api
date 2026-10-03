const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuItem');

router.post('/', authenticate, createMenuItem);
router.get('/', getMenuItems);        // supports ?category_id=X filter
router.get('/:id', getMenuItem);
router.patch('/:id', authenticate, updateMenuItem);
router.delete('/:id', authenticate, deleteMenuItem);

module.exports = router;
