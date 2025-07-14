import React, { useEffect, useState, useMemo } from 'react';
import adminApi from '../../api/adminApi';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
  Paper, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const statusOptions = ['pending', 'preparing', 'completed', 'cancelled'];
const filterOptions = ['all', ...statusOptions];

const PendingItemsSummary = ({ orders }) => {
  const summary = useMemo(() => {
    const itemCounts = {};
    orders.forEach(order => {
      if (order.orderStatus === 'pending' || order.orderStatus === 'preparing') {
        order.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
        });
      }
    });
    return Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  if (summary.length === 0) {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Pending Items Overview</Typography>
            <Typography>All items are prepared!</Typography>
        </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Pending Items Overview</Typography>
      <Grid container spacing={2}>
        {summary.map(([name, qty]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
            <Box sx={{ 
              p: 1.5, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1,
              textAlign: 'center',
              bgcolor: 'background.default',
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 150
            }}>
              <Typography variant="body2" fontWeight="bold" noWrap title={name}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total pending: {qty}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const AdminDailyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchDailyOrders = async () => {
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

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter(order => filterStatus === 'all' || order.orderStatus === filterStatus)
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.dailyOrderNumber - b.dailyOrderNumber;
        }
        return b.dailyOrderNumber - a.dailyOrderNumber;
      });
  }, [orders, filterStatus, sortOrder]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Today's Orders</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
           <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={e => setFilterStatus(e.target.value)}
              >
                {filterOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} title={`Sort by Order Number ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
              {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
            </IconButton>
        </Box>
      </Box>

      <PendingItemsSummary orders={orders} />

      {filteredAndSortedOrders.length === 0 ? (
        <Typography>
          {filterStatus === 'all' ? 'No orders for today yet.' : `No orders with status "${filterStatus}".`}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedOrders.map(order => (
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
