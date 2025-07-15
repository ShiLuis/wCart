import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Star,
  Person,
  Reply,
  TrendingUp,
  Restaurant
} from '@mui/icons-material';
import axios from 'axios';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get('/api/reviews/stats');
      setReviewStats(response.data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToReview = (review) => {
    setSelectedReview(review);
    setAdminResponse(review.adminResponse || '');
    setResponseDialogOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedReview || !adminResponse.trim()) return;

    try {
      await axios.put(`/api/reviews/${selectedReview._id}/respond`, {
        adminResponse: adminResponse.trim()
      });
      
      // Update the local state
      setReviews(reviews.map(review => 
        review._id === selectedReview._id 
          ? { ...review, adminResponse: adminResponse.trim() }
          : review
      ));
      
      setResponseDialogOpen(false);
      setAdminResponse('');
      setSelectedReview(null);
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit response');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
      fetchReviewStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    }
  };

  const getColorForRating = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const StatCard = ({ title, value, icon, color = "primary", subtitle }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        ⭐ Customer Reviews Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Review Statistics */}
      {reviewStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Rating"
              value={reviewStats.averageRating?.toFixed(1) || '0.0'}
              icon={<Star />}
              color="warning"
              subtitle={`Based on ${reviewStats.totalReviews} reviews`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Reviews"
              value={reviewStats.totalReviews || 0}
              icon={<Person />}
              color="primary"
              subtitle="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="5-Star Reviews"
              value={reviewStats.ratingBreakdown?.[5] || 0}
              icon={<TrendingUp />}
              color="success"
              subtitle={`${((reviewStats.ratingBreakdown?.[5] || 0) / (reviewStats.totalReviews || 1) * 100).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Needs Response"
              value={reviews.filter(r => !r.adminResponse).length}
              icon={<Reply />}
              color="error"
              subtitle="Pending replies"
            />
          </Grid>
        </Grid>
      )}

      {/* Rating Distribution */}
      {reviewStats?.ratingBreakdown && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rating Distribution
            </Typography>
            <Grid container spacing={2}>
              {[5, 4, 3, 2, 1].map(rating => (
                <Grid item xs key={rating}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Rating value={rating} readOnly size="small" sx={{ mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {reviewStats.ratingBreakdown[rating] || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rating} star{rating !== 1 ? 's' : ''}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Reviews
          </Typography>
          <List>
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No reviews available
              </Typography>
            ) : (
              reviews.map((review, index) => (
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
                            {review.customerName || 'Anonymous'}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" sx={{ mr: 2 }} />
                          <Chip
                            label={`Order #${review.orderId}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()} at{' '}
                            {new Date(review.createdAt).toLocaleTimeString()}
                          </Typography>
                          
                          {/* Admin Response */}
                          {review.adminResponse && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                <Restaurant sx={{ fontSize: 16, mr: 1 }} />
                                Restaurant Response:
                              </Typography>
                              <Typography variant="body2">
                                {review.adminResponse}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Action Buttons */}
                          <Box sx={{ mt: 2 }}>
                            <Button
                              size="small"
                              startIcon={<Reply />}
                              onClick={() => handleRespondToReview(review)}
                              sx={{ mr: 1 }}
                            >
                              {review.adminResponse ? 'Edit Response' : 'Respond'}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => deleteReview(review._id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReview?.adminResponse ? 'Edit Response' : 'Respond to Review'}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Customer Review:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={selectedReview.rating} readOnly size="small" sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  by {selectedReview.customerName || 'Anonymous'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                "{selectedReview.comment}"
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Your Response"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            placeholder="Thank you for your feedback! We appreciate..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitResponse} 
            variant="contained"
            disabled={!adminResponse.trim()}
          >
            {selectedReview?.adminResponse ? 'Update Response' : 'Submit Response'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsManagement;
