const mongoose = require('mongoose'); // Add this line
const bcrypt = require('bcryptjs'); // Add this line for bcrypt

const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, select: false }, // select: false hides password by default
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10); // Use bcrypt directly
  this.password = await bcrypt.hash(this.password, salt); // Use bcrypt directly
  next();
});

// Method to compare password
adminUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Use bcrypt directly
};

module.exports = mongoose.model('AdminUser', adminUserSchema);