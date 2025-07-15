const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  itemsReviewed: [{
    itemName: String,
    itemRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  isVisible: {
    type: Boolean,
    default: true
  },
  adminResponse: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add index for better query performance
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
