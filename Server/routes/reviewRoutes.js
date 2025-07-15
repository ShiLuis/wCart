const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewStats,
  updateAdminResponse,
  toggleReviewVisibility,
  getAllReviewsAdmin
} = require('../controllers/reviewController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createReview);
router.get('/', getReviews);

// Admin routes
router.get('/admin', protectAdmin, getAllReviewsAdmin);
router.get('/stats', protectAdmin, getReviewStats);
router.put('/:id/response', protectAdmin, updateAdminResponse);
router.put('/:id/toggle-visibility', protectAdmin, toggleReviewVisibility);

module.exports = router;
