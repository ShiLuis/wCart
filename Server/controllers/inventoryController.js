const Ingredient = require('../models/Ingredient');
const MenuItem = require('../models/MenuItem');
const { getIO } = require('../config/socket');

// Helper function to send inventory notifications
const sendInventoryNotification = (type, ingredient, message) => {
  try {
    const io = getIO();
    const notificationData = {
      type, // 'low_stock', 'out_of_stock', 'expired', 'restocked'
      ingredient: ingredient.name,
      message,
      timestamp: new Date().toISOString(),
      stockLevel: ingredient.currentStock,
      unit: ingredient.unit,
      stockStatus: ingredient.stockStatus
    };
    
    // Send to all connected clients
    io.emit('inventory-alert', notificationData);
    
    // Send specifically to inventory management room
    io.to('inventory-management').emit('inventory-update', notificationData);
    
    console.log(`Inventory notification sent: ${message}`);
  } catch (err) {
    console.log('Socket.io not available for inventory notification:', err.message);
  }
};

// @desc    Get all ingredients with stock status
// @route   GET /api/inventory/ingredients
// @access  Admin
const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ isActive: true }).sort({ name: 1 });
    
    // Add stock alerts
    const lowStockItems = ingredients.filter(i => i.stockStatus === 'low_stock');
    const outOfStockItems = ingredients.filter(i => i.stockStatus === 'out_of_stock');
    const expiringSoon = ingredients.filter(i => {
      if (!i.expiryDate) return false;
      const daysUntilExpiry = i.daysUntilExpiry;
      return daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });

    res.json({
      ingredients,
      alerts: {
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length,
        expiringSoon: expiringSoon.length
      },
      lowStockItems,
      outOfStockItems,
      expiringSoon
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching ingredients.', error: error.message });
  }
};

// @desc    Add new ingredient
// @route   POST /api/inventory/ingredients
// @access  Admin
const addIngredient = async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    const savedIngredient = await ingredient.save();
    
    // Update menu availability after adding ingredient
    await MenuItem.updateAllAvailability();
    
    res.status(201).json(savedIngredient);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Ingredient with this name already exists.' });
    } else {
      res.status(500).json({ message: 'Server error while adding ingredient.', error: error.message });
    }
  }
};

// @desc    Update ingredient stock
// @route   PUT /api/inventory/ingredients/:id/stock
// @access  Admin
const updateStock = async (req, res) => {
  try {
    const { action, quantity, reason } = req.body; // action: 'add' or 'subtract'
    
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    const oldStock = ingredient.currentStock;
    const oldStatus = ingredient.stockStatus;

    if (action === 'add') {
      ingredient.currentStock += quantity;
      ingredient.lastRestocked = new Date();
    } else if (action === 'subtract') {
      ingredient.currentStock = Math.max(0, ingredient.currentStock - quantity);
    } else if (action === 'set') {
      ingredient.currentStock = quantity;
    }

    await ingredient.save();

    // Send notifications for stock changes
    if (oldStatus !== ingredient.stockStatus) {
      if (ingredient.stockStatus === 'out_of_stock') {
        sendInventoryNotification(
          'out_of_stock',
          ingredient,
          `🚨 ${ingredient.name} is OUT OF STOCK! Menu items may be unavailable.`
        );
      } else if (ingredient.stockStatus === 'low_stock') {
        sendInventoryNotification(
          'low_stock',
          ingredient,
          `⚠️ ${ingredient.name} is running low (${ingredient.currentStock} ${ingredient.unit} remaining)`
        );
      } else if (ingredient.stockStatus === 'in_stock' && oldStatus !== 'in_stock') {
        sendInventoryNotification(
          'restocked',
          ingredient,
          `✅ ${ingredient.name} has been restocked (${ingredient.currentStock} ${ingredient.unit})`
        );
      }
    }

    // Update menu availability
    await MenuItem.updateAllAvailability();

    // Log the stock change
    console.log(`Stock ${action}: ${ingredient.name} - ${oldStock} → ${ingredient.currentStock} ${ingredient.unit} (${reason || 'No reason provided'})`);

    res.json({
      ingredient,
      stockChange: {
        action,
        oldStock,
        newStock: ingredient.currentStock,
        quantity,
        reason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating stock.', error: error.message });
  }
};

// @desc    Process ingredient consumption for an order
// @route   POST /api/inventory/consume
// @access  Public (called internally)
const consumeIngredients = async (orderItems) => {
  try {
    const consumptionLog = [];

    for (let orderItem of orderItems) {
      // Find the menu item and populate ingredients
      const menuItem = await MenuItem.findOne({ name: orderItem.name }).populate('ingredients.ingredient');
      
      if (!menuItem) {
        console.log(`Menu item not found: ${orderItem.name}`);
        consumptionLog.push({
          menuItem: orderItem.name,
          error: 'Menu item not found',
          status: 'failed'
        });
        continue;
      }
      
      if (!menuItem.ingredients || menuItem.ingredients.length === 0) {
        console.log(`No ingredients defined for menu item: ${orderItem.name}`);
        consumptionLog.push({
          menuItem: orderItem.name,
          message: 'No ingredients defined - skipping consumption',
          status: 'skipped'
        });
        continue;
      }

      const quantity = orderItem.quantity || orderItem.qty || 1;

      // Consume ingredients for this menu item
      for (let recipeIngredient of menuItem.ingredients) {
        const ingredient = recipeIngredient.ingredient;
        
        if (!ingredient) {
          console.log(`Ingredient reference missing for menu item: ${orderItem.name}`);
          continue;
        }
        
        const consumeAmount = recipeIngredient.quantity * quantity;

        // Update ingredient stock
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
          ingredient._id,
          { $inc: { currentStock: -consumeAmount } },
          { new: true }
        );

        if (!updatedIngredient) {
          console.log(`Failed to update ingredient: ${ingredient.name}`);
          continue;
        }

        consumptionLog.push({
          menuItem: orderItem.name,
          ingredient: ingredient.name,
          consumed: consumeAmount,
          unit: ingredient.unit,
          remainingStock: updatedIngredient.currentStock,
          status: 'success'
        });

        // Check for low stock alerts
        if (updatedIngredient.stockStatus === 'out_of_stock') {
          sendInventoryNotification(
            'out_of_stock',
            updatedIngredient,
            `🚨 ${ingredient.name} is OUT OF STOCK after order consumption!`
          );
        } else if (updatedIngredient.stockStatus === 'low_stock') {
          sendInventoryNotification(
            'low_stock',
            updatedIngredient,
            `⚠️ ${ingredient.name} is now low in stock (${updatedIngredient.currentStock} ${ingredient.unit} remaining)`
          );
        }
      }
    }

    // Update menu availability after consumption
    await MenuItem.updateAllAvailability();

    return consumptionLog;
  } catch (error) {
    console.error('Error consuming ingredients:', error);
    throw error;
  }
};

// @desc    Get inventory dashboard data
// @route   GET /api/inventory/dashboard
// @access  Admin
const getInventoryDashboard = async (req, res) => {
  try {
    const totalIngredients = await Ingredient.countDocuments({ isActive: true });
    const lowStockCount = await Ingredient.countDocuments({ stockStatus: 'low_stock' });
    const outOfStockCount = await Ingredient.countDocuments({ stockStatus: 'out_of_stock' });
    
    // Get expiring ingredients (within 7 days)
    const expiringIngredients = await Ingredient.find({
      isActive: true,
      expiryDate: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        $gte: new Date()
      }
    });

    // Get most consumed ingredients (based on low stock frequency)
    const criticalIngredients = await Ingredient.find({
      stockStatus: { $in: ['low_stock', 'out_of_stock'] }
    }).sort({ currentStock: 1 }).limit(5);

    // Calculate total inventory value
    const ingredients = await Ingredient.find({ isActive: true });
    const totalValue = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.currentStock * ingredient.costPerUnit);
    }, 0);

    res.json({
      summary: {
        totalIngredients,
        lowStockCount,
        outOfStockCount,
        expiringCount: expiringIngredients.length,
        totalValue: totalValue.toFixed(2)
      },
      criticalIngredients,
      expiringIngredients: expiringIngredients.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching inventory dashboard.', error: error.message });
  }
};

// @desc    Get menu items affected by ingredient stock
// @route   GET /api/inventory/affected-menu
// @access  Admin
const getAffectedMenuItems = async (req, res) => {
  try {
    const outOfStockIngredients = await Ingredient.find({ stockStatus: 'out_of_stock' });
    const lowStockIngredients = await Ingredient.find({ stockStatus: 'low_stock' });

    const affectedItems = await MenuItem.find({
      $or: [
        { 'ingredients.ingredient': { $in: outOfStockIngredients.map(i => i._id) } },
        { 'ingredients.ingredient': { $in: lowStockIngredients.map(i => i._id) } }
      ]
    }).populate('ingredients.ingredient');

    const result = affectedItems.map(item => {
      const unavailableIngredients = [];
      const lowStockWarnings = [];

      item.ingredients.forEach(recipeIngredient => {
        const ingredient = recipeIngredient.ingredient;
        if (ingredient.stockStatus === 'out_of_stock') {
          unavailableIngredients.push(ingredient.name);
        } else if (ingredient.stockStatus === 'low_stock') {
          lowStockWarnings.push(ingredient.name);
        }
      });

      return {
        menuItem: item.name,
        category: item.category,
        isAvailable: item.isAvailable,
        unavailableIngredients,
        lowStockWarnings,
        status: unavailableIngredients.length > 0 ? 'unavailable' : 
                lowStockWarnings.length > 0 ? 'warning' : 'available'
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching affected menu items.', error: error.message });
  }
};

// @desc    Get single ingredient by ID
// @route   GET /api/inventory/ingredients/:id
// @access  Admin
const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching ingredient.', error: error.message });
  }
};

// @desc    Update ingredient details
// @route   PUT /api/inventory/ingredients/:id
// @access  Admin
const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        ingredient[key] = req.body[key];
      }
    });

    const updatedIngredient = await ingredient.save();
    
    // Update menu availability after ingredient update
    await MenuItem.updateAllAvailability();
    
    res.json(updatedIngredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating ingredient.', error: error.message });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/inventory/ingredients/:id
// @access  Admin
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // Check if ingredient is used in any menu items
    const menuItemsUsingIngredient = await MenuItem.find({
      'ingredients.ingredient': ingredient._id
    });

    if (menuItemsUsingIngredient.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete ingredient - it is used in menu items',
        affectedMenuItems: menuItemsUsingIngredient.map(item => item.name)
      });
    }

    // Soft delete by setting isActive to false
    ingredient.isActive = false;
    await ingredient.save();

    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting ingredient.', error: error.message });
  }
};

module.exports = {
  getIngredients,
  addIngredient,
  updateStock,
  consumeIngredients,
  getInventoryDashboard,
  getAffectedMenuItems,
  getIngredientById,
  updateIngredient,
  deleteIngredient
};
