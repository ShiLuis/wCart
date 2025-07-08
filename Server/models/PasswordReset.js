const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
