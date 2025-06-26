const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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