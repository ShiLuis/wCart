import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const statusOptions = ['pending payment', 'preparing', 'completed', 'cancelled'];

const AdminDailyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDailyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/orders/today');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch daily orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyOrders();
    const interval = setInterval(fetchDailyOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.put(`/orders/${orderId}/status`, { status: newStatus });
      // Optimistically update the UI
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Today's Orders</Typography>
      {orders.length === 0 ? (
        <Typography>No orders for today yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid item key={order._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    Order #{order.dailyOrderNumber}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    ID: {order.orderId}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Customer:</strong> {order.contact?.name}<br />
                    <strong>Contact:</strong> {order.contact?.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Items:</strong>
                  </Typography>
                  <ul>
                    {order.items.map(item => (
                      <li key={item._id}>{item.name} x {item.qty}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                   <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={order.orderStatus}
                      label="Status"
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminDailyOrdersPage;
