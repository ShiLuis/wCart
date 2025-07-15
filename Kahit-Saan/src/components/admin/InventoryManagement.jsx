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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add,
  Warning,
  Error,
  CheckCircle,
  Edit,
  Remove,
  Inventory,
  TrendingDown,
  Schedule,
  Restaurant
} from '@mui/icons-material';
import axios from 'axios';

const InventoryManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [affectedMenu, setAffectedMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  
  // Form states
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: '',
    currentStock: 0,
    unit: '',
    minStockLevel: 10,
    maxStockLevel: 100,
    costPerUnit: 0,
    expiryDate: ''
  });
  
  const [stockUpdate, setStockUpdate] = useState({
    action: 'add',
    quantity: 0,
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingredientsRes, dashboardRes, menuRes] = await Promise.all([
        axios.get('/api/inventory/ingredients'),
        axios.get('/api/inventory/dashboard'),
        axios.get('/api/inventory/affected-menu')
      ]);
      
      setIngredients(ingredientsRes.data.ingredients);
      setDashboard(dashboardRes.data);
      setAffectedMenu(menuRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async () => {
    try {
      await axios.post('/api/inventory/ingredients', newIngredient);
      setAddDialogOpen(false);
      setNewIngredient({
        name: '',
        category: '',
        currentStock: 0,
        unit: '',
        minStockLevel: 10,
        maxStockLevel: 100,
        costPerUnit: 0,
        expiryDate: ''
      });
      fetchData();
    } catch (error) {
      setError('Failed to add ingredient');
    }
  };

  const handleStockUpdate = async () => {
    try {
      await axios.put(`/api/inventory/ingredients/${selectedIngredient._id}/stock`, stockUpdate);
      setStockDialogOpen(false);
      setStockUpdate({ action: 'add', quantity: 0, reason: '' });
      setSelectedIngredient(null);
      fetchData();
    } catch (error) {
      setError('Failed to update stock');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'in_stock': return <CheckCircle />;
      case 'low_stock': return <Warning />;
      case 'out_of_stock': return <Error />;
      default: return <Inventory />;
    }
  };

  const StatCard = ({ title, value, icon, color = "primary", subtitle, alert = false }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {alert ? (
            <Badge badgeContent="!" color="error">
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
            </Badge>
          ) : (
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
          )}
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

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
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
        📦 Inventory Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Ingredients"
              value={dashboard.summary.totalIngredients}
              icon={<Inventory />}
              color="primary"
              subtitle="Active ingredients"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Low Stock"
              value={dashboard.summary.lowStockCount}
              icon={<Warning />}
              color="warning"
              subtitle="Need restocking"
              alert={dashboard.summary.lowStockCount > 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Out of Stock"
              value={dashboard.summary.outOfStockCount}
              icon={<Error />}
              color="error"
              subtitle="Unavailable"
              alert={dashboard.summary.outOfStockCount > 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Expiring Soon"
              value={dashboard.summary.expiringCount}
              icon={<Schedule />}
              color="warning"
              subtitle="Within 7 days"
              alert={dashboard.summary.expiringCount > 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Value"
              value={`₱${dashboard.summary.totalValue}`}
              icon={<TrendingDown />}
              color="success"
              subtitle="Inventory worth"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Ingredients" />
          <Tab 
            label={
              <Badge badgeContent={affectedMenu.filter(item => item.status !== 'available').length} color="error">
                Affected Menu
              </Badge>
            } 
          />
          <Tab label="Critical Items" />
        </Tabs>
      </Paper>

      {/* Ingredients Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ingredient Inventory</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Ingredient
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient._id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>
                    <Chip label={ingredient.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {ingredient.currentStock}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((ingredient.currentStock / ingredient.maxStockLevel) * 100, 100)}
                        sx={{ 
                          width: 60, 
                          mr: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: ingredient.stockStatus === 'out_of_stock' ? 'error.main' :
                                           ingredient.stockStatus === 'low_stock' ? 'warning.main' : 'success.main'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {Math.min(Math.round((ingredient.currentStock / ingredient.maxStockLevel) * 100), 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStockStatusIcon(ingredient.stockStatus)}
                      label={ingredient.stockStatus.replace('_', ' ').toUpperCase()}
                      color={getStockStatusColor(ingredient.stockStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    {ingredient.expiryDate ? (
                      <Typography 
                        variant="caption" 
                        color={ingredient.daysUntilExpiry <= 7 ? 'error' : 'text.secondary'}
                      >
                        {new Date(ingredient.expiryDate).toLocaleDateString()}
                        {ingredient.daysUntilExpiry !== null && (
                          <br />
                        )}
                        {ingredient.daysUntilExpiry !== null && (
                          `${ingredient.daysUntilExpiry} days`
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No expiry
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Update Stock">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedIngredient(ingredient);
                          setStockDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Affected Menu Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Menu Items Affected by Stock Levels
        </Typography>
        <Grid container spacing={2}>
          {affectedMenu.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderLeft: 4, 
                  borderColor: item.status === 'unavailable' ? 'error.main' : 
                              item.status === 'warning' ? 'warning.main' : 'success.main'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{item.menuItem}</Typography>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={item.status === 'unavailable' ? 'error' : 
                            item.status === 'warning' ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {item.category}
                  </Typography>
                  
                  {item.unavailableIngredients.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="error">
                        Out of stock: {item.unavailableIngredients.join(', ')}
                      </Typography>
                    </Box>
                  )}
                  
                  {item.lowStockWarnings.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="warning.main">
                        Low stock: {item.lowStockWarnings.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Critical Items Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Critical Inventory Items
        </Typography>
        <Grid container spacing={3}>
          {dashboard?.criticalIngredients?.map((ingredient) => (
            <Grid item xs={12} sm={6} md={4} key={ingredient._id}>
              <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {ingredient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {ingredient.category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" color="error" sx={{ mr: 1 }}>
                      {ingredient.currentStock}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ingredient.unit}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStockStatusIcon(ingredient.stockStatus)}
                    label={ingredient.stockStatus.replace('_', ' ').toUpperCase()}
                    color={getStockStatusColor(ingredient.stockStatus)}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Ingredient Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Ingredient</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ingredient Name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newIngredient.category}
                  label="Category"
                  onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                >
                  <MenuItem value="meat">Meat</MenuItem>
                  <MenuItem value="vegetable">Vegetable</MenuItem>
                  <MenuItem value="sauce">Sauce</MenuItem>
                  <MenuItem value="spice">Spice</MenuItem>
                  <MenuItem value="grain">Grain</MenuItem>
                  <MenuItem value="dairy">Dairy</MenuItem>
                  <MenuItem value="seafood">Seafood</MenuItem>
                  <MenuItem value="beverage">Beverage</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={newIngredient.currentStock}
                onChange={(e) => setNewIngredient({ ...newIngredient, currentStock: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={newIngredient.unit}
                  label="Unit"
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                >
                  <MenuItem value="kg">Kilogram (kg)</MenuItem>
                  <MenuItem value="g">Gram (g)</MenuItem>
                  <MenuItem value="l">Liter (l)</MenuItem>
                  <MenuItem value="ml">Milliliter (ml)</MenuItem>
                  <MenuItem value="pieces">Pieces</MenuItem>
                  <MenuItem value="cups">Cups</MenuItem>
                  <MenuItem value="tbsp">Tablespoon</MenuItem>
                  <MenuItem value="tsp">Teaspoon</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level"
                type="number"
                value={newIngredient.minStockLevel}
                onChange={(e) => setNewIngredient({ ...newIngredient, minStockLevel: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Stock Level"
                type="number"
                value={newIngredient.maxStockLevel}
                onChange={(e) => setNewIngredient({ ...newIngredient, maxStockLevel: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Per Unit (₱)"
                type="number"
                value={newIngredient.costPerUnit}
                onChange={(e) => setNewIngredient({ ...newIngredient, costPerUnit: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={newIngredient.expiryDate}
                onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddIngredient} variant="contained">
            Add Ingredient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Stock: {selectedIngredient?.name}
        </DialogTitle>
        <DialogContent>
          {selectedIngredient && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Stock: {selectedIngredient.currentStock} {selectedIngredient.unit}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={stockUpdate.action}
                  label="Action"
                  onChange={(e) => setStockUpdate({ ...stockUpdate, action: e.target.value })}
                >
                  <MenuItem value="add">Add Stock (Restock)</MenuItem>
                  <MenuItem value="subtract">Remove Stock (Usage/Waste)</MenuItem>
                  <MenuItem value="set">Set Exact Amount</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseFloat(e.target.value) || 0 })}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="Reason (Optional)"
                value={stockUpdate.reason}
                onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                placeholder="e.g., Weekly delivery, Expired items removed, etc."
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStockUpdate} variant="contained">
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;
