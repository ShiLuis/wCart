const express = require('express');
const router = express.Router();
const {
  getSalesAnalytics,
  getOrderStatusAnalytics,
  getHourlyOrderAnalytics,
  getInventoryAnalytics,
  getConsumptionAnalytics
} = require('../controllers/analyticsController');

// Sales analytics routes
router.get('/sales', getSalesAnalytics);
router.get('/order-status', getOrderStatusAnalytics);
router.get('/hourly-orders', getHourlyOrderAnalytics);

// Inventory analytics routes
router.get('/inventory', getInventoryAnalytics);
router.get('/consumption', getConsumptionAnalytics);

module.exports = router;
