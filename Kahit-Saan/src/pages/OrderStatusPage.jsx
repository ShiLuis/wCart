import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Clock,
  ShoppingCart,
  Cancel,
  Restaurant
} from '@mui/icons-material';
import axios from 'axios';

const OrderStatusPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trackOrder = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const response = await axios.get(`/api/orders/track/${orderNumber}`);
      setOrderData(response.data);
    } catch (error) {
      console.error('Error tracking order:', error);
      if (error.response?.status === 404) {
        setError('Order not found. Please check the number and try again.');
      } else {
        setError('Failed to track order. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock />;
      case 'preparing': return <Restaurant />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <ShoppingCart />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Your order is pending payment confirmation.';
      case 'preparing': return 'Great! Your order is being prepared by our chefs.';
      case 'completed': return 'Your order is ready for pickup! 🎉';
      case 'cancelled': return 'Your order has been cancelled.';
      default: return 'Unknown status';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      trackOrder();
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        🔍 Track Your Order
      </Typography>

      {/* Order Search */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter Your Order Number
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Order Number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 1"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={trackOrder}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                sx={{ height: 56 }}
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Order Status Display */}
      {orderData && (
        <>
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order #{orderData.dailyOrderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Order placed today
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      badgeContent={getStatusIcon(orderData.orderStatus)}
                      color={getStatusColor(orderData.orderStatus)}
                      sx={{ mr: 2 }}
                    >
                      <Box sx={{ width: 40, height: 40 }} />
                    </Badge>
                    <Box>
                      <Chip
                        label={orderData.orderStatus.toUpperCase()}
                        color={getStatusColor(orderData.orderStatus)}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        {getStatusMessage(orderData.orderStatus)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Progress
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Order Received"
                          secondary="✓ Completed"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Payment Processing"
                          secondary={orderData.orderStatus === 'pending' ? '⏳ In Progress' : '✓ Completed'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Preparing Food"
                          secondary={
                            orderData.orderStatus === 'preparing' ? '👨‍🍳 In Progress' :
                            orderData.orderStatus === 'completed' ? '✓ Completed' :
                            '⏳ Waiting'
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Ready for Pickup"
                          secondary={orderData.orderStatus === 'completed' ? '🎉 Ready!' : '⏳ Waiting'}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Help Section */}
      <Card elevation={2} sx={{ mt: 4, bgcolor: 'info.lighter' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Order numbers are assigned when you place your order
            • You can only track orders placed today
            • If you're having trouble, please contact our staff
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderStatusPage;
