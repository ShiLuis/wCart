const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
  try {
    const { orderId, customerName, customerEmail, rating, comment, itemsReviewed } = req.body;

    // Check if order exists and is completed
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed orders' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    const review = new Review({
      orderId,
      customerName,
      customerEmail,
      rating,
      comment,
      itemsReviewed
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review', error: error.message });
  }
};

// @desc    Get all visible reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    
    const query = { isVisible: true };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'dailyOrderNumber orderDate');

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Admin
const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ isVisible: true });
    
    const ratingDistribution = await Review.aggregate([
      { $match: { isVisible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const averageRating = await Review.aggregate([
      { $match: { isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const recentReviews = await Review.find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('orderId', 'dailyOrderNumber');

    res.json({
      totalReviews,
      averageRating: averageRating[0]?.avg || 0,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item._id,
        count: item.count
      })),
      recentReviews
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Server error while fetching review stats' });
  }
};

// @desc    Update admin response to review
// @route   PUT /api/reviews/:id/response
// @access  Admin
const updateAdminResponse = async (req, res) => {
  try {
    const { adminResponse } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.adminResponse = adminResponse;
    const updatedReview = await review.save();

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating admin response:', error);
    res.status(500).json({ message: 'Server error while updating admin response' });
  }
};

// @desc    Toggle review visibility
// @route   PUT /api/reviews/:id/toggle-visibility
// @access  Admin
const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isVisible = !review.isVisible;
    const updatedReview = await review.save();

    res.json({
      message: `Review ${updatedReview.isVisible ? 'shown' : 'hidden'} successfully`,
      review: updatedReview
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    res.status(500).json({ message: 'Server error while toggling review visibility' });
  }
};

// @desc    Get all reviews for admin
// @route   GET /api/reviews/admin
// @access  Admin
const getAllReviewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'dailyOrderNumber orderDate');

    const total = await Review.countDocuments({});

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching all reviews for admin:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewStats,
  updateAdminResponse,
  toggleReviewVisibility,
  getAllReviewsAdmin
};
