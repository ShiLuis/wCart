const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['meat', 'vegetable', 'sauce', 'spice', 'grain', 'dairy', 'seafood', 'beverage', 'other']
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'cups', 'tbsp', 'tsp', 'oz', 'lbs']
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 100
  },
  costPerUnit: {
    type: Number,
    required: true,
    default: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  expiryDate: {
    type: Date
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update stock status based on current stock
ingredientSchema.pre('save', function(next) {
  if (this.currentStock <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.currentStock <= this.minStockLevel) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

// Virtual for stock percentage
ingredientSchema.virtual('stockPercentage').get(function() {
  return Math.round((this.currentStock / this.maxStockLevel) * 100);
});

// Virtual for days until expiry
ingredientSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
