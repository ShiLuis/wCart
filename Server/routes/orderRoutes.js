const express = require('express');
const router = express.Router();
console.log('orderRoutes.js module loaded'); // Diagnostic log
const { addOrderItems, getOrders, getDailyOrders, updateOrderStatus, updateOrderWithBankDetails, trackOrder } = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware'); // Assuming you want to protect admin routes

// Create a new order (for customers)
router.post('/', addOrderItems);

// Get all orders (for admin)
router.get('/', protectAdmin, getOrders);

// Get today's orders (for admin)
router.get('/today', protectAdmin, getDailyOrders);

router.get('/track/:dailyOrderNumber', trackOrder);

// Update order status (for admin)
router.put('/:id/status', protectAdmin, updateOrderStatus);

// Update order with bank details (for customers)
router.put('/:id/bankdetails', updateOrderWithBankDetails);

module.exports = router;