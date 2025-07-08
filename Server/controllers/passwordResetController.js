const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const PasswordReset = require('../models/PasswordReset');

// @desc    Request a password reset
// @route   POST /api/password-reset/request
// @access  Public
const requestPasswordReset = async (req, res) => {
  const { username } = req.body;
  const io = req.app.get('socketio');

  try {
    const user = await AdminUser.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new password reset request
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    const resetRequest = new PasswordReset({
      userId: user._id,
      token,
      expiresAt,
    });

    await resetRequest.save();

    // Emit a notification to all connected admins to update their lists
    io.emit('passwordResetRequestUpdated');

    res.status(201).json({ message: 'Password reset request submitted. An admin will review it shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all pending password reset requests
// @route   GET /api/password-reset/requests
// @access  Private/Admin
const getPendingRequests = async (req, res) => {
  try {
    const requests = await PasswordReset.find({ status: 'pending' }).populate('userId', 'username');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a password reset request
// @route   PUT /api/password-reset/requests/:id/approve
// @access  Private/Admin
const approveRequest = async (req, res) => {
  const io = req.app.get('socketio');

  try {
    const request = await PasswordReset.findById(req.params.id).populate('userId', 'username');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'approved';
    request.handledBy = req.adminUser.id; // The admin who approved it
    await request.save();

    // Emit event to the specific user waiting on the forgot password page
    if (request.userId && request.userId.username) {
        io.emit(`passwordResetApproved_${request.userId.username}`, { token: request.token });
    }

    // Notify all admins to refresh their request list
    io.emit('passwordResetRequestUpdated');

    res.json({ message: 'Password reset request approved.', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a password reset request
// @route   PUT /api/password-reset/requests/:id/reject
// @access  Private/Admin
const rejectRequest = async (req, res) => {
  const io = req.app.get('socketio');
  try {
    const request = await PasswordReset.findById(req.params.id).populate('userId', 'username');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'rejected';
    request.handledBy = req.adminUser.id;
    await request.save();

    // Emit event to the specific user waiting on the forgot password page
    if (request.userId && request.userId.username) {
        io.emit(`passwordResetRejected_${request.userId.username}`);
    }

    // Notify all admins to refresh their request list
    io.emit('passwordResetRequestUpdated');

    res.json({ message: 'Password reset request rejected.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password with a valid token
// @route   POST /api/password-reset/reset/:token
// @access  Public
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetRequest = await PasswordReset.findOne({
      token,
      status: 'approved',
      expiresAt: { $gt: Date.now() },
    });

    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const user = await AdminUser.findById(resetRequest.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password; // The pre-save hook in AdminUser model will hash it
    await user.save();

    // Mark the request as completed so the token cannot be reused
    resetRequest.status = 'completed';
    await resetRequest.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error); // Add this line for detailed logging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get the status of a password reset request
// @route   GET /api/password-reset/status/:username
// @access  Public
const getRequestStatus = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await AdminUser.findOne({ username });

    if (!user) {
      // To prevent username enumeration, we send a generic success-like response
      // even if the user does not exist. The frontend will just keep polling.
      return res.json({ status: 'pending' });
    }

    // Find the most recent password reset request for this user
    const request = await PasswordReset.findOne({ userId: user._id }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({ message: 'No password reset request found for this user.' });
    }

    // If the request is approved, send the token back
    if (request.status === 'approved') {
      return res.json({ status: request.status, token: request.token });
    }

    // For any other status, just send the status
    res.json({ status: request.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestPasswordReset,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  resetPassword,
  getRequestStatus,
};
