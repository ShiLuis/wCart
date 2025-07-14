const mongoose = require('mongoose');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const DailyCounter = require('../models/DailyCounter'); // Import DailyCounter
const axios = require('axios');
const { getIO } = require('../config/socket');

// Helper function to send real-time notifications
const sendOrderNotification = (orderId, message, status) => {
  try {
    const io = getIO();
    io.to(`order-${orderId}`).emit('order-update', {
      orderId,
      message,
      status,
      timestamp: new Date().toISOString()
    });
    console.log(`Notification sent to order-${orderId}:`, message);
  } catch (err) {
    console.log('Socket.io not available for notification:', err.message);
  }
};

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

      // --- Bank API Integration ---
      console.log('Processing payment through bank API...');
      console.log('Payment details:', {
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        amount: totalPrice
      });

      try {
        // First, verify the account exists in the bank system
        console.log('Verifying account in bank system...');
        const usersResponse = await axios.get('http://192.168.8.201:5000/api/users');
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const foundUser = users.find(user => 
          user.accountNumber === bankDetails.accountNumber || 
          user.account_number === bankDetails.accountNumber ||
          user.id === bankDetails.accountNumber
        );

        if (!foundUser) {
          throw new Error('Account not found in bank system');
        }

        console.log('Account verified:', foundUser);

        // Try different possible transfer endpoints
        let transferSuccess = false;
        let transactionId = null;
        let transferError = null;

        // Attempt 1: Try /api/transfer endpoint
        try {
          console.log('Attempting transfer via /api/transfer...');
          const transferData = {
            fromAccountNumber: bankDetails.accountNumber,
            toAccountNumber: '12345678901', // Restaurant's account number
            amount: totalPrice,
            description: `Payment for order ${order.dailyOrderNumber || order._id}`,
            fromAccountName: bankDetails.accountName,
            toAccountName: 'Kahit Saan Restaurant'
          };

          const transferResponse = await axios.post('http://192.168.8.201:5000/api/transfer', transferData);
          if (transferResponse.data && transferResponse.data.success) {
            transferSuccess = true;
            transactionId = transferResponse.data.transactionId || transferResponse.data.id;
            console.log('Transfer successful via /api/transfer');
          }
        } catch (transferErr) {
          console.log('Transfer via /api/transfer failed:', transferErr.response?.data || transferErr.message);
          transferError = transferErr;
        }

        // Attempt 2: Try /api/transactions endpoint if first attempt failed
        if (!transferSuccess) {
          try {
            console.log('Attempting transfer via /api/transactions...');
            const transactionData = {
              fromAccount: bankDetails.accountNumber,
              toAccount: '12345678901',
              amount: totalPrice,
              type: 'transfer',
              description: `Payment for order ${order.dailyOrderNumber || order._id}`
            };

            const transactionResponse = await axios.post('http://192.168.8.201:5000/api/transactions', transactionData);
            if (transactionResponse.data && (transactionResponse.data.success || transactionResponse.status === 200 || transactionResponse.status === 201)) {
              transferSuccess = true;
              transactionId = transactionResponse.data.id || transactionResponse.data.transactionId || Date.now().toString();
              console.log('Transfer successful via /api/transactions');
            }
          } catch (transactionErr) {
            console.log('Transfer via /api/transactions failed:', transactionErr.response?.data || transactionErr.message);
          }
        }

        // Attempt 3: Try /api/pay endpoint if other attempts failed
        if (!transferSuccess) {
          try {
            console.log('Attempting payment via /api/pay...');
            const paymentData = {
              accountNumber: bankDetails.accountNumber,
              accountName: bankDetails.accountName,
              amount: totalPrice,
              merchantAccount: '12345678901',
              orderId: order.dailyOrderNumber || order._id
            };

            const paymentResponse = await axios.post('http://192.168.8.201:5000/api/pay', paymentData);
            if (paymentResponse.data && (paymentResponse.data.success || paymentResponse.status === 200)) {
              transferSuccess = true;
              transactionId = paymentResponse.data.transactionId || paymentResponse.data.id || Date.now().toString();
              console.log('Payment successful via /api/pay');
            }
          } catch (payErr) {
            console.log('Payment via /api/pay failed:', payErr.response?.data || payErr.message);
          }
        }

        if (transferSuccess) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.orderStatus = 'preparing';
          order.transactionId = transactionId;
          
          // Send notification about successful payment
          sendOrderNotification(
            order._id,
            `Payment successful! Your order #${order.dailyOrderNumber} is now being prepared.`,
            'preparing'
          );
          
          console.log('Payment successful, order updated to preparing');
        } else {
          // All transfer attempts failed, but account exists - set as pending for manual processing
          order.orderStatus = 'pending';
          order.paymentError = 'Payment processing temporarily unavailable. Order will be processed manually.';
          console.log('All payment methods failed, setting order to pending for manual processing');
          
          // Send notification about payment pending
          sendOrderNotification(
            order._id,
            `Order #${order.dailyOrderNumber} received. Payment will be processed manually by admin.`,
            'pending'
          );
        }

      } catch (verificationError) {
        console.error("Account verification error:", verificationError.message);
        
        // Handle specific verification errors
        if (verificationError.message.includes('Account not found')) {
          order.orderStatus = 'pending';
          order.paymentError = 'Account not found. Please verify your account number.';
        } else if (verificationError.code === 'ECONNREFUSED' || verificationError.code === 'ERR_NETWORK') {
          order.orderStatus = 'pending';
          order.paymentError = 'Bank service unavailable. Order will be processed manually.';
        } else {
          order.orderStatus = 'pending';
          order.paymentError = 'Payment verification failed. Order will be processed manually.';
        }
        
        // Send notification about verification error
        sendOrderNotification(
          order._id,
          `Order #${order.dailyOrderNumber} received. ${order.paymentError}`,
          'pending'
        );
      }

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
      const oldStatus = order.orderStatus;
      order.orderStatus = status;
      const updatedOrder = await order.save();
      
      // Send real-time notification to customer
      const statusMessages = {
        'pending': 'Your order is pending payment confirmation.',
        'preparing': 'Great! Your order is now being prepared.',
        'completed': 'Your order is ready for pickup!',
        'cancelled': 'Your order has been cancelled.'
      };
      
      const message = statusMessages[status] || `Your order status has been updated to ${status}`;
      sendOrderNotification(order._id, message, status);
      
      console.log(`Order ${order.orderId} status changed from ${oldStatus} to ${status}`);
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
