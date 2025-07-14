import React, { useEffect, useState, useMemo } from 'react';
import adminApi from '../../api/adminApi';
import {
  Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, MenuItem, Select, TextField,
  FormControl, InputLabel, TableSortLabel, Grid
} from '@mui/material';

const statusOptions = ['all', 'pending', 'preparing', 'completed', 'cancelled'];

const AdminOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedOrders = useMemo(() => {
    let sortableOrders = [...orders];

    // Filtering
    if (filterStatus !== 'all') {
      sortableOrders = sortableOrders.filter(order => order.orderStatus === filterStatus);
    }
    if (searchTerm) {
      sortableOrders = sortableOrders.filter(order =>
        order.contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.dailyOrderNumber && order.dailyOrderNumber.toString().includes(searchTerm))
      );
    }

    // Sorting
    sortableOrders.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'customer') {
        aValue = a.contact?.name || '';
        bValue = b.contact?.name || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortableOrders;
  }, [orders, filterStatus, searchTerm, sortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Order Management</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search by Name, Order ID, or Daily #"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={e => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortConfig.key === 'orderId' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig.key === 'orderId'}
                    direction={sortConfig.key === 'orderId' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('orderId')}
                  >
                    Order ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortConfig.key === 'dailyOrderNumber' ? sortConfig.direction : false}>
                   <TableSortLabel
                    active={sortConfig.key === 'dailyOrderNumber'}
                    direction={sortConfig.key === 'dailyOrderNumber' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('dailyOrderNumber')}
                  >
                    Daily #
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortConfig.key === 'customer' ? sortConfig.direction : false}>
                   <TableSortLabel
                    active={sortConfig.key === 'customer'}
                    direction={sortConfig.key === 'customer' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('customer')}
                  >
                    Customer
                  </TableSortLabel>
                </TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sortDirection={sortConfig.key === 'createdAt' ? sortConfig.direction : false}>
                   <TableSortLabel
                    active={sortConfig.key === 'createdAt'}
                    direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedOrders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.dailyOrderNumber}</TableCell>
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
                      sx={{minWidth: 120}}
                    >
                      {['pending', 'preparing', 'completed', 'cancelled'].map(status => (
                        <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
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