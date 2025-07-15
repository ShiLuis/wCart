const mongoose = require('mongoose');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const DailyCounter = require('../models/DailyCounter'); // Import DailyCounter
const axios = require('axios');
const { getIO } = require('../config/socket');
const { consumeIngredients } = require('./inventoryController');

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
    console.log('Received bank details request for order:', req.params.id);
    console.log('Bank details:', bankDetails);

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Found order:', order._id);
    console.log('Order items:', order.items);

    order.bankDetails = bankDetails;

    // Calculate total price from items
    const totalPrice = order.items.reduce((acc, item) => {
      const quantity = item.quantity || item.qty || 1;
      const price = item.price || 0;
      console.log(`Item: ${item.name}, Price: ${price}, Qty: ${quantity}`);
      return acc + (price * quantity);
    }, 0);
    
    if (totalPrice <= 0) {
      console.error('Invalid total price calculated:', totalPrice);
      return res.status(400).json({ message: 'Invalid order total. Please check your items.' });
    }

    order.totalPrice = totalPrice;

    console.log('Calculated total price:', totalPrice);

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

        // Check if user has sufficient balance
        if (foundUser.balance < totalPrice) {
          throw new Error(`Insufficient balance. Available: ₱${foundUser.balance}, Required: ₱${totalPrice}`);
        }

        // Process payment through bank API using the correct endpoint
        console.log('Processing transfer via /api/users/transfer...');
        const transferData = {
          fromUserId: foundUser._id,
          toAccountNumber: '322785837406', // Restaurant account
          amount: totalPrice,
          description: `Payment for order ${order.dailyOrderNumber || order._id} - Kahit Saan Restaurant`
        };

        console.log('Sending payment request to bank API:', transferData);
        const transferResponse = await axios.post('http://192.168.8.201:5000/api/users/transfer', transferData);
        
        console.log('Bank API response:', transferResponse.data);

        if (transferResponse.data && transferResponse.data.message === 'Transfer successful') {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.orderStatus = 'preparing';
          order.transactionId = transferResponse.data.transaction?._id || transferResponse.data.transaction?.transactionId || Date.now().toString();
          
          // Send notification about successful payment
          sendOrderNotification(
            order._id,
            `Payment successful! Your order #${order.dailyOrderNumber} is now being prepared.`,
            'preparing'
          );
          
          console.log('Payment successful, order updated to preparing');
          console.log('Transaction ID:', order.transactionId);
          console.log('Customer balance after payment:', transferResponse.data.balance);
        } else {
          throw new Error('Transfer failed: ' + (transferResponse.data?.message || 'Unknown error'));
        }

      } catch (paymentError) {
        console.error("Bank payment error:", paymentError.message);
        console.error("Error details:", {
          code: paymentError.code,
          status: paymentError.response?.status,
          statusText: paymentError.response?.statusText,
          data: paymentError.response?.data
        });
        
        // Handle specific payment errors
        if (paymentError.message.includes('Account not found')) {
          order.orderStatus = 'pending';
          order.paymentError = 'Account not found. Please verify your account number.';
        } else if (paymentError.message.includes('Insufficient balance')) {
          order.orderStatus = 'pending';
          order.paymentError = paymentError.message;
        } else if (paymentError.response?.status === 500) {
          order.orderStatus = 'pending';
          order.paymentError = 'Bank server error. Order will be processed manually.';
        } else if (paymentError.code === 'ECONNREFUSED' || paymentError.code === 'ERR_NETWORK') {
          order.orderStatus = 'pending';
          order.paymentError = 'Bank service unavailable. Order will be processed manually.';
        } else if (paymentError.response?.status === 400) {
          order.orderStatus = 'pending';
          order.paymentError = 'Invalid payment details: ' + (paymentError.response.data?.message || 'Please check your account information');
        } else {
          order.orderStatus = 'pending';
          order.paymentError = 'Payment processing failed: ' + (paymentError.message || 'Unknown error');
        }
        
        // Send notification about payment error
        sendOrderNotification(
          order._id,
          `Payment error for order #${order.dailyOrderNumber}: ${order.paymentError}`,
          'pending'
        );
        
        console.log('Payment failed, order set to pending:', order.paymentError);
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order with bank details:", error);
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
      
      // If order is being marked as completed, consume ingredients
      if (status === 'completed' && oldStatus !== 'completed') {
        try {
          console.log('Order completed - consuming ingredients for order:', order._id);
          const consumptionLog = await consumeIngredients(order.items);
          console.log('Ingredient consumption log:', consumptionLog);
          
          // Store consumption log in the order
          order.ingredientConsumption = consumptionLog;
        } catch (consumptionError) {
          console.error('Error consuming ingredients:', consumptionError);
          // Don't fail the order status update, but log the error
        }
      }
      
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
