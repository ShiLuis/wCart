import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import {
  Star,
  Person,
  Restaurant,
  RateReview
} from '@mui/icons-material';
import axios from 'axios';

const CustomerReviews = ({ orderId, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Form state
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
    customerName: ''
  });

  useEffect(() => {
    fetchReviews();
    if (orderId) {
      checkIfReviewed();
    }
  }, [orderId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews/public');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfReviewed = async () => {
    try {
      const response = await axios.get(`/api/reviews/order/${orderId}`);
      setHasReviewed(response.data.length > 0);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData.rating || !reviewData.comment.trim()) {
      setError('Please provide both a rating and comment');
      return;
    }

    if (!orderId) {
      setError('Order ID is required to submit a review');
      return;
    }

    try {
      const response = await axios.post('/api/reviews', {
        orderId,
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        customerName: reviewData.customerName.trim() || 'Anonymous'
      });

      setSuccess('Thank you for your review! Your feedback helps us improve.');
      setDialogOpen(false);
      setHasReviewed(true);
      setReviewData({
        rating: 0,
        comment: '',
        customerName: ''
      });
      
      // Refresh reviews
      fetchReviews();
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 409) {
        setError('You have already reviewed this order');
        setHasReviewed(true);
      } else if (error.response?.status === 404) {
        setError('Order not found or not completed yet');
      } else {
        setError(error.response?.data?.message || 'Failed to submit review');
      }
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const getColorForRating = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        ⭐ Customer Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Write Review Section */}
      {orderId && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Share Your Experience
            </Typography>
            {hasReviewed ? (
              <Alert severity="info">
                Thank you! You have already reviewed this order.
              </Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How was your experience with order #{orderId}?
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RateReview />}
                  onClick={() => setDialogOpen(true)}
                >
                  Write a Review
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mr: 2 }}>
                  {getAverageRating()}
                </Typography>
                <Box>
                  <Rating value={parseFloat(getAverageRating())} readOnly precision={0.1} />
                  <Typography variant="body2" color="text.secondary">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rating Breakdown
              </Typography>
              {[5, 4, 3, 2, 1].map(rating => {
                const count = getRatingDistribution()[rating];
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {rating}
                    </Typography>
                    <Star sx={{ fontSize: 16, mx: 1, color: 'warning.main' }} />
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            backgroundColor: 'warning.main',
                            width: `${percentage}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews List */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Reviews ({reviews.length})
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No reviews yet. Be the first to share your experience!
              </Typography>
            </Box>
          ) : (
            <List>
              {reviews.map((review, index) => (
                <React.Fragment key={review._id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getColorForRating(review.rating) + '.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ mr: 2 }}>
                            {review.customerName}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" sx={{ mr: 2 }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {review.comment}
                          </Typography>
                          
                          {/* Restaurant Response */}
                          {review.adminResponse && (
                            <Paper sx={{ p: 2, bgcolor: 'grey.50', borderLeft: 3, borderColor: 'primary.main' }}>
                              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <Restaurant sx={{ fontSize: 16, mr: 1 }} />
                                Restaurant Response:
                              </Typography>
                              <Typography variant="body2">
                                {review.adminResponse}
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Review Submission Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Rating *
            </Typography>
            <Rating
              value={reviewData.rating}
              onChange={(event, newValue) => {
                setReviewData({ ...reviewData, rating: newValue });
              }}
              size="large"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Your Name (Optional)"
              value={reviewData.customerName}
              onChange={(e) => setReviewData({ ...reviewData, customerName: e.target.value })}
              sx={{ mb: 3 }}
              placeholder="Anonymous"
            />
            
            <TextField
              fullWidth
              label="Your Review *"
              multiline
              rows={4}
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="Tell us about your experience with the food, service, and overall satisfaction..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitReview} 
            variant="contained"
            disabled={!reviewData.rating || !reviewData.comment.trim()}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerReviews;
