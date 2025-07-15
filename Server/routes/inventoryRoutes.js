const express = require('express');
const router = express.Router();
const {
  getIngredients,
  getIngredientById,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  updateStock,
  getInventoryDashboard,
  getAffectedMenuItems
} = require('../controllers/inventoryController');

// @route   GET /api/inventory/ingredients
// @desc    Get all ingredients with stock status
// @access  Admin
router.get('/ingredients', getIngredients);

// @route   GET /api/inventory/ingredients/:id
// @desc    Get single ingredient by ID
// @access  Admin
router.get('/ingredients/:id', getIngredientById);

// @route   POST /api/inventory/ingredients
// @desc    Add new ingredient
// @access  Admin
router.post('/ingredients', addIngredient);

// @route   PUT /api/inventory/ingredients/:id
// @desc    Update ingredient details
// @access  Admin
router.put('/ingredients/:id', updateIngredient);

// @route   DELETE /api/inventory/ingredients/:id
// @desc    Delete ingredient (soft delete)
// @access  Admin
router.delete('/ingredients/:id', deleteIngredient);

// @route   PUT /api/inventory/ingredients/:id/stock
// @desc    Update ingredient stock (add, subtract, or set)
// @access  Admin
router.put('/ingredients/:id/stock', updateStock);

// @route   GET /api/inventory/dashboard
// @desc    Get inventory dashboard data
// @access  Admin
router.get('/dashboard', getInventoryDashboard);

// @route   GET /api/inventory/affected-menu
// @desc    Get menu items affected by ingredient stock
// @access  Admin
router.get('/affected-menu', getAffectedMenuItems);

module.exports = router;
