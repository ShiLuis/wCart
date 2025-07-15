const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');
const MenuItem = require('../models/MenuItem');

// @desc    Get sales analytics for dashboard
// @route   GET /api/analytics/sales
// @access  Admin
const getSalesAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Today's stats
    const todayOrders = await Order.find({ 
      orderDate: today,
      isPaid: true 
    });
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const todayOrderCount = todayOrders.length;

    // Last 7 days stats
    const weekOrders = await Order.find({
      orderDate: { $gte: sevenDaysAgo },
      isPaid: true
    });
    
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const weekOrderCount = weekOrders.length;

    // Last 30 days stats
    const monthOrders = await Order.find({
      orderDate: { $gte: thirtyDaysAgo },
      isPaid: true
    });
    
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const monthOrderCount = monthOrders.length;

    // Daily revenue for the last 7 days (for charts)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const dayOrders = await Order.find({ 
        orderDate: date,
        isPaid: true 
      });
      const revenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      dailyRevenue.push({
        date,
        revenue,
        orders: dayOrders.length
      });
    }

    // Most popular items
    const allOrders = await Order.find({ isPaid: true });
    const itemSales = {};
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        const quantity = item.quantity || item.qty || 1;
        
        if (itemSales[itemName]) {
          itemSales[itemName].quantity += quantity;
          itemSales[itemName].revenue += (item.price * quantity);
        } else {
          itemSales[itemName] = {
            name: itemName,
            quantity: quantity,
            revenue: item.price * quantity,
            price: item.price
          };
        }
      });
    });

    const popularItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      today: {
        revenue: todayRevenue,
        orders: todayOrderCount
      },
      week: {
        revenue: weekRevenue,
        orders: weekOrderCount,
        averageDaily: Math.round(weekRevenue / 7)
      },
      month: {
        revenue: monthRevenue,
        orders: monthOrderCount,
        averageDaily: Math.round(monthRevenue / 30)
      },
      dailyRevenue,
      popularItems
    });

  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics', error: error.message });
  }
};

// @desc    Get order status distribution
// @route   GET /api/analytics/order-status
// @access  Admin
const getOrderStatusAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    const statusCounts = await Order.aggregate([
      { $match: { orderDate: today } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const statusData = {
      pending: 0,
      preparing: 0,
      completed: 0,
      cancelled: 0
    };

    statusCounts.forEach(status => {
      statusData[status._id] = status.count;
    });

    res.json(statusData);
  } catch (error) {
    console.error('Error fetching order status analytics:', error);
    res.status(500).json({ message: 'Server error while fetching order status analytics', error: error.message });
  }
};

// @desc    Get hourly order distribution
// @route   GET /api/analytics/hourly-orders
// @access  Admin
const getHourlyOrderAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    const orders = await Order.find({ orderDate: today });
    
    const hourlyData = Array(24).fill(0);
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour]++;
    });

    const chartData = hourlyData.map((count, hour) => ({
      hour: `${hour}:00`,
      orders: count
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching hourly analytics:', error);
    res.status(500).json({ message: 'Server error while fetching hourly analytics', error: error.message });
  }
};

// @desc    Get inventory analytics for dashboard
// @route   GET /api/analytics/inventory
// @access  Admin
const getInventoryAnalytics = async (req, res) => {
  try {
    // Get basic inventory stats
    const totalIngredients = await Ingredient.countDocuments({ isActive: true });
    const lowStockCount = await Ingredient.countDocuments({ stockStatus: 'low_stock' });
    const outOfStockCount = await Ingredient.countDocuments({ stockStatus: 'out_of_stock' });
    const inStockCount = await Ingredient.countDocuments({ stockStatus: 'in_stock' });
    
    // Get expiring ingredients (within 7 days)
    const expiringIngredients = await Ingredient.find({
      isActive: true,
      expiryDate: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        $gte: new Date()
      }
    });

    // Calculate total inventory value
    const ingredients = await Ingredient.find({ isActive: true });
    const totalValue = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.currentStock * ingredient.costPerUnit);
    }, 0);

    // Get stock distribution by category
    const categoryStats = await Ingredient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } },
          lowStockItems: {
            $sum: { $cond: [{ $eq: ['$stockStatus', 'low_stock'] }, 1, 0] }
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ['$stockStatus', 'out_of_stock'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Get most critical ingredients (lowest stock levels)
    const criticalIngredients = await Ingredient.find({
      isActive: true,
      stockStatus: { $in: ['low_stock', 'out_of_stock'] }
    })
    .sort({ currentStock: 1 })
    .limit(10)
    .select('name currentStock unit stockStatus minStockLevel');

    // Get unavailable menu items due to stock
    const unavailableMenuItems = await MenuItem.find({
      isAvailable: false,
      autoManageAvailability: true
    }).select('name category');

    // Stock trend over time (last 7 days consumption)
    const stockTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      // Count orders completed on this date
      const completedOrders = await Order.countDocuments({
        orderDate: date,
        orderStatus: 'completed'
      });

      stockTrend.push({
        date,
        ordersCompleted: completedOrders
      });
    }

    res.json({
      summary: {
        totalIngredients,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        expiringCount: expiringIngredients.length,
        totalValue: totalValue.toFixed(2),
        unavailableMenuItems: unavailableMenuItems.length
      },
      categoryStats,
      criticalIngredients,
      unavailableMenuItems,
      expiringIngredients: expiringIngredients.slice(0, 5),
      stockTrend
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: 'Server error while fetching inventory analytics', error: error.message });
  }
};

// @desc    Get ingredient consumption analytics
// @route   GET /api/analytics/consumption
// @access  Admin
const getConsumptionAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Get orders with ingredient consumption logs
    const ordersWithConsumption = await Order.find({
      orderDate: { $gte: thirtyDaysAgo },
      orderStatus: 'completed',
      ingredientConsumption: { $exists: true, $ne: [] }
    });

    // Aggregate consumption by ingredient
    const consumptionByIngredient = {};
    
    ordersWithConsumption.forEach(order => {
      if (order.ingredientConsumption) {
        order.ingredientConsumption.forEach(log => {
          if (!consumptionByIngredient[log.ingredient]) {
            consumptionByIngredient[log.ingredient] = {
              name: log.ingredient,
              totalConsumed: 0,
              unit: log.unit,
              orderCount: 0
            };
          }
          consumptionByIngredient[log.ingredient].totalConsumed += log.consumed;
          consumptionByIngredient[log.ingredient].orderCount++;
        });
      }
    });

    // Convert to array and sort by consumption
    const topConsumedIngredients = Object.values(consumptionByIngredient)
      .sort((a, b) => b.totalConsumed - a.totalConsumed)
      .slice(0, 10);

    res.json({
      period: '30 days',
      totalOrdersAnalyzed: ordersWithConsumption.length,
      topConsumedIngredients
    });
  } catch (error) {
    console.error('Error fetching consumption analytics:', error);
    res.status(500).json({ message: 'Server error while fetching consumption analytics', error: error.message });
  }
};

module.exports = {
  getSalesAnalytics,
  getOrderStatusAnalytics,
  getHourlyOrderAnalytics,
  getInventoryAnalytics,
  getConsumptionAnalytics
};
