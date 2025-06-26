const mongoose = require('mongoose'); // Add this line

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  photo: {
    url: { type: String, default: 'https://placehold.co/600x400/1A1A1A/D4AF37?text=No+Image+Provided' },
    public_id: { type: String }, // For Cloudinary asset management
  },
  category: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);