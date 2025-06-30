const mongoose = require('mongoose');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const DailyCounter = require('../models/DailyCounter'); // Import DailyCounter
const axios = require('axios');

// Function to generate a date-time based Order ID
function generateDateTimeOrderId() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 25
  const day = now.getDate().toString().padStart(2, '0'); // 30
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 06
  const hours = now.getHours(); // 9
  const minutes = now.getMinutes().toString().padStart(2, '0'); // 14
  const ampm = hours >= 12 ? 'p' : 'a'; // a
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0'); // 09

  return `${year}${day}${month}${ampm}${formattedHours}${minutes}`;
}

// Function to get the next daily sequence number
async function getNextDailySequence(date) {
  const counter = await DailyCounter.findByIdAndUpdate(
    date,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const addOrderItems = async (req, res) => {
  const { items, contact } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    const orderId = generateDateTimeOrderId(); // Use the new date-time based ID
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0, 10);
    const dailyOrderNumber = await getNextDailySequence(today);

    const order = new Order({
      orderId,
      dailyOrderNumber,
      orderDate: today,
      items, 
      contact, 
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error); // Enhanced error logging
    res.status(500).json({ message: 'Server error while creating order.', error: error.message });
  }
};

// @desc    Update order with bank details and process payment
// @route   PUT /api/orders/:id/bankdetails
// @access  Public
const updateOrderWithBankDetails = async (req, res) => {
  const { bankDetails } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.bankDetails = bankDetails;

      // Calculate total price from items
      const totalPrice = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      order.totalPrice = totalPrice; // Save the total price

      // --- Bank API Integration Placeholder ---
      // The following section is commented out until the bank API is available.
      // const bankApiUrl = `http://<CLASSMATE_IP_ADDRESS>/api/pay`;
      // try {
      //   const paymentResponse = await axios.post(bankApiUrl, {
      //     accountNumber: bankDetails.accountNumber,
      //     accountName: bankDetails.accountName,
      //     bankName: bankDetails.bankName,
      //     amount: totalPrice,
      //   });
      //   if (paymentResponse.data.success) {
      //     order.isPaid = true;
      //     order.paidAt = Date.now();
      //     order.orderStatus = 'Processing';
      //   } else {
      //     order.orderStatus = 'Payment Failed';
      //   }
      // } catch (paymentError) {
      //   console.error("Bank API Error:", paymentError.message);
      //   order.orderStatus = 'Payment Pending';
      // }

      // Simulating success for now:
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'preparing'; // Changed from 'Processing' to a valid enum value

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error("Error updating order with bank details:", error); // Enhanced error logging
    res.status(500).json({ message: 'Server error while updating order.', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching orders.', error: error.message });
  }
};

// @desc    Get all orders for the current day
// @route   GET /api/orders/today
// @access  Admin
const getDailyOrders = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD
    const orders = await Order.find({ orderDate: today }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching daily orders.', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating order status.', error: error.message });
  }
};

// @desc    Track order by daily number
// @route   GET /api/orders/track/:dailyOrderNumber
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      dailyOrderNumber: req.params.dailyOrderNumber,
      orderDate: new Date().toISOString().slice(0, 10) // Match today's date
    });

    if (order) {
      res.json({ orderStatus: order.orderStatus, dailyOrderNumber: order.dailyOrderNumber });
    } else {
      res.status(404).json({ message: 'Order not found for today. Please check the number or try again tomorrow.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while tracking order.', error: error.message });
  }
};


// NOTE: Keep other exports if they exist (e.g., getOrders, updateOrderStatus)
module.exports = { addOrderItems, updateOrderWithBankDetails, getOrders, getDailyOrders, updateOrderStatus, trackOrder };
