const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  resetPassword,
  getRequestStatus,
} = require('../controllers/passwordResetController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// @desc    Request a password reset
// @route   POST /api/password-reset/request
// @access  Public
router.post('/request', requestPasswordReset);

// @desc    Get all pending password reset requests
// @route   GET /api/password-reset/requests
// @access  Private/Admin
router.get('/requests', protectAdmin, getPendingRequests);

// @desc    Approve a password reset request
// @route   PUT /api/password-reset/requests/:id/approve
// @access  Private/Admin
router.put('/requests/:id/approve', protectAdmin, approveRequest);

// @desc    Reject a password reset request
// @route   PUT /api/password-reset/requests/:id/reject
// @access  Private/Admin
router.put('/requests/:id/reject', protectAdmin, rejectRequest);

// @desc    Reset password with a valid token
// @route   POST /api/password-reset/reset/:token
// @access  Public
router.post('/reset/:token', resetPassword);

// @desc    Check the status of a password reset request
// @route   GET /api/password-reset/status/:username
// @access  Public
router.get('/status/:username', getRequestStatus);

module.exports = router;
