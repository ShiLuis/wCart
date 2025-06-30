const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String, // Changed from Number to String to accommodate the new format
    unique: true,
  },
  dailyOrderNumber: {
    type: Number,
  },
  orderDate: {
      type: String, 
  },
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      qty: Number,
    }
  ],
  contact: {
    name: String,
    phone: String,
    email: String,
  },
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'preparing', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);