const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./middleware/logger');

const userRoute = require('./routes/user.route');
const categoryRoute = require('./routes/category.route');
const menuItemRoute = require('./routes/menuItem.route');
const orderRoute = require('./routes/order.route');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Restaurant Management API is running',
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/users', userRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/menu-items', menuItemRoute);
app.use('/api/orders', orderRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

module.exports = app;
