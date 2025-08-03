import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Restaurant,
  Star,
  AttachMoney,
  Today,
  Inventory,
  Warning,
  Error,
  CheckCircle,
  Timeline,
  Category
} from '@mui/icons-material';
import adminApi from '../../api/adminApi';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [consumptionData, setConsumptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesResponse, statusResponse, inventoryResponse, consumptionResponse] = await Promise.all([
        adminApi.get('/analytics/sales'),
        adminApi.get('/analytics/order-status'),
        adminApi.get('/analytics/inventory'),
        adminApi.get('/analytics/consumption')
      ]);
      
      // Ensure data integrity with fallbacks
      setAnalyticsData({
        ...salesResponse.data,
        dailyRevenue: salesResponse.data?.dailyRevenue || [],
        popularItems: salesResponse.data?.popularItems || [],
        averageOrderValue: salesResponse.data?.averageOrderValue || 0
      });
      
      setOrderStatusData(statusResponse.data || {});
      setInventoryData({
        ...inventoryResponse.data,
        criticalIngredients: inventoryResponse.data?.criticalIngredients || []
      });
      
      setConsumptionData({
        ...consumptionResponse.data,
        topConsumedIngredients: (consumptionResponse.data?.topConsumedIngredients || []).map(ingredient => ({
          ...ingredient,
          name: ingredient.name || 'Unknown',
          totalConsumed: ingredient.totalConsumed || 0,
          unit: ingredient.unit || ''
        }))
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(`Failed to load analytics data: ${error.response?.data?.message || error.message}`);
      
      // Set default empty states to prevent render errors
      setAnalyticsData({ dailyRevenue: [], popularItems: [], averageOrderValue: 0 });
      setOrderStatusData({});
      setInventoryData({ criticalIngredients: [] });
      setConsumptionData({ topConsumedIngredients: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main Analytics Content */}
        <Grid item xs={12} lg={8}>
          {/* Revenue Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Today sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Today's Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    ₱{analyticsData?.today?.revenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analyticsData?.today?.orders || 0} orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    This Week
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₱{analyticsData?.week?.revenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analyticsData?.week?.orders || 0} orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    ₱{analyticsData?.month?.revenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analyticsData?.month?.orders || 0} orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Average Order
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    ₱{analyticsData?.averageOrderValue?.toFixed(2) || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per order
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Order Status and Popular Items */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '160px', mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCart sx={{ mr: 1 }} />
                    Order Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {orderStatusData?.pending || 0}
                        </Typography>
                        <Typography variant="body2">Pending</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {orderStatusData?.preparing || 0}
                        </Typography>
                        <Typography variant="body2">Preparing</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {orderStatusData?.completed || 0}
                        </Typography>
                        <Typography variant="body2">Completed</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {orderStatusData?.cancelled || 0}
                        </Typography>
                        <Typography variant="body2">Cancelled</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 1 }} />
                    7-Day Revenue Trend
                  </Typography>
                  <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
                    {analyticsData?.dailyRevenue?.length > 0 ? (
                      <Box sx={{ height: '100%', position: 'relative', p: 2 }}>
                        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Line path */}
                          <path
                            d={(() => {
                              const revenues = analyticsData.dailyRevenue.map(d => d.revenue || 0);
                              const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 1;
                              const points = analyticsData.dailyRevenue.map((day, index) => {
                                const x = (index / (analyticsData.dailyRevenue.length - 1)) * 380 + 10;
                                const y = maxRevenue > 0 ? 140 - (((day.revenue || 0) / maxRevenue) * 120) : 140;
                                return `${x},${y}`;
                              });
                              return `M ${points.join(' L ')}`;
                            })()}
                            fill="none"
                            stroke="#1976d2"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          
                          {/* Data points */}
                          {analyticsData.dailyRevenue.map((day, index) => {
                            const revenues = analyticsData.dailyRevenue.map(d => d.revenue || 0);
                            const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 1;
                            const x = (index / (analyticsData.dailyRevenue.length - 1)) * 380 + 10;
                            const y = maxRevenue > 0 ? 140 - (((day.revenue || 0) / maxRevenue) * 120) : 140;
                            
                            return (
                              <g key={index}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="#1976d2"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              </g>
                            );
                          })}
                        </svg>
                        
                        {/* X-axis labels */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          mt: 1,
                          px: 1
                        }}>
                          {analyticsData?.dailyRevenue?.map((day, index) => (
                            <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                              <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>
                                {day.date ? `${new Date(day.date).getDate()}/${new Date(day.date).getMonth() + 1}` : 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="primary" fontWeight="bold">
                                ₱{day.revenue || 0}
                              </Typography>
                            </Box>
                          )) || []}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No daily revenue data available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Restaurant sx={{ mr: 1 }} />
                    Popular Items
                  </Typography>
                  <List dense>
                    {analyticsData?.popularItems?.slice(0, 5).map((item, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={item.name || 'Unknown item'}
                          secondary={`₱${item.price || 0} • ${item.quantity || 0} orders`}
                        />
                        <Chip
                          label={`₱${(item.revenue || 0).toLocaleString()}`}
                          color="primary"
                          size="small"
                        />
                      </ListItem>
                    )) || (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No popular items data available
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Inventory Analytics Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Inventory Overview */}
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory sx={{ mr: 1 }} />
                  Inventory Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <CheckCircle sx={{ fontSize: 30, color: 'success.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {inventoryData?.summary?.inStockCount || 0}
                      </Typography>
                      <Typography variant="body2">In Stock</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                      <Warning sx={{ fontSize: 30, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {inventoryData?.summary?.lowStockCount || 0}
                      </Typography>
                      <Typography variant="body2">Low Stock</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                      <Error sx={{ fontSize: 30, color: 'error.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {inventoryData?.summary?.outOfStockCount || 0}
                      </Typography>
                      <Typography variant="body2">Out of Stock</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                      <AttachMoney sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        ₱{inventoryData?.summary?.totalValue || '0'}
                      </Typography>
                      <Typography variant="body2">Total Value</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Critical Items */}
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Error sx={{ mr: 1, color: 'error.main' }} />
                  Critical Items
                </Typography>
                <List dense>
                  {inventoryData?.criticalIngredients?.slice(0, 5).map((ingredient, index) => (
                    <ListItem key={index} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={ingredient.name}
                        secondary={`${ingredient.currentStock} ${ingredient.unit}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip
                        label={ingredient.stockStatus === 'out_of_stock' ? 'OUT' : 'LOW'}
                        color={ingredient.stockStatus === 'out_of_stock' ? 'error' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  )) || (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      ✅ No critical items
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Top Consumed */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1 }} />
                  Top Consumed (30 days)
                </Typography>
                <List dense>
                  {consumptionData?.topConsumedIngredients?.slice(0, 5).map((ingredient, index) => {
                    const validConsumptions = consumptionData.topConsumedIngredients
                      .map(i => i.totalConsumed || 0)
                      .filter(val => val > 0);
                    const maxConsumption = validConsumptions.length > 0 ? Math.max(...validConsumptions) : 1;
                    const consumedAmount = ingredient.totalConsumed || 0;
                    const percentage = maxConsumption > 0 ? (consumedAmount / maxConsumption) * 100 : 0;
                    
                    return (
                      <ListItem key={index} divider sx={{ px: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {ingredient.name || 'Unknown ingredient'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {consumedAmount.toFixed(1)} {ingredient.unit || ''}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </ListItem>
                    );
                  }) || (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No consumption data
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
