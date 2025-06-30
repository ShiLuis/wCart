import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi'; // Import the adminApi instance
import {
  Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, MenuItem, Select
} from '@mui/material';

const statusOptions = ['pending', 'preparing', 'completed', 'cancelled'];

const AdminOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // No need to construct baseUrl, adminApi has it configured
      const res = await adminApi.get('/orders'); // Use adminApi and relative path
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      // No need to construct baseUrl, adminApi has it configured
      await adminApi.put(`/orders/${orderId}/status`, { status: newStatus }); // Use adminApi
      await fetchOrders();
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Order Management</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Daily #</TableCell> {/* New Column */}
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderId}</TableCell> {/* Use orderId */}
                  <TableCell>{order.dailyOrderNumber}</TableCell> {/* New Column */}
                  <TableCell>{order.contact?.name}</TableCell>
                  <TableCell>
                    {order.contact?.phone}<br />
                    {order.contact?.email}
                  </TableCell>
                  <TableCell>
                    {order.items.map(i => (
                      <div key={i._id}>{i.name} x{i.qty} (₱{i.price})</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={order.orderStatus}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminOrderManagementPage;