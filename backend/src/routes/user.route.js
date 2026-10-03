const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const { validate } = require('../middleware/validator');
const registrationValidation = require('../validators/registration');
const loginValidation = require('../validators/login');
const {
  userFinalReg,
  login,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');

// Auth routes
router.post('/register', validate(registrationValidation), userFinalReg);
router.post('/login', validate(loginValidation), login);

// CRUD routes
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUser);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

module.exports = router;
