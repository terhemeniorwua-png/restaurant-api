const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category');

router.post('/', authenticate, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory);
router.patch('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

module.exports = router;
