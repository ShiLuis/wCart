const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create a new order (for customers)
router.post('/', async (req, res) => {
  try {
    const { items, contact, notes } = req.body;
    if (!items || !contact) {
      return res.status(400).json({ message: 'Missing order data.' });
    }
    const order = new Order({ items, contact, notes });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// Get all orders (for admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// Update order status (for admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

module.exports = router;