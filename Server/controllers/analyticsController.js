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
    // Get all active ingredients and calculate counts manually (countDocuments has issues with stockStatus)
    const allIngredients = await Ingredient.find({ isActive: true }, 'stockStatus expiryDate currentStock costPerUnit category');
    
    const totalIngredients = allIngredients.length;
    const lowStockCount = allIngredients.filter(ing => ing.stockStatus === 'low_stock').length;
    const outOfStockCount = allIngredients.filter(ing => ing.stockStatus === 'out_of_stock').length;
    const inStockCount = allIngredients.filter(ing => ing.stockStatus === 'in_stock').length;
    
    // Get expiring ingredients (within 7 days) from the ingredients we already fetched
    const expiringIngredients = allIngredients.filter(ing => {
      if (!ing.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(ing.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    });

    // Calculate total inventory value
    const totalValue = allIngredients.reduce((sum, ingredient) => {
      return sum + (ingredient.currentStock * ingredient.costPerUnit);
    }, 0);

    // Get stock distribution by category using the ingredients we already have
    const categoryStats = allIngredients.reduce((acc, ingredient) => {
      const category = ingredient.category;
      if (!acc[category]) {
        acc[category] = {
          _id: category,
          count: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        };
      }
      
      acc[category].count += 1;
      acc[category].totalValue += (ingredient.currentStock * ingredient.costPerUnit);
      
      if (ingredient.stockStatus === 'low_stock') {
        acc[category].lowStockItems += 1;
      } else if (ingredient.stockStatus === 'out_of_stock') {
        acc[category].outOfStockItems += 1;
      }
      
      return acc;
    }, {});

    // Convert to array and sort by total value
    const categoryStatsArray = Object.values(categoryStats).sort((a, b) => b.totalValue - a.totalValue);

    // Get most critical ingredients (lowest stock levels)
    const criticalIngredients = await Ingredient.find({
      isActive: true,
      $or: [
        { stockStatus: 'low_stock' },
        { stockStatus: 'out_of_stock' }
      ]
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
      categoryStats: categoryStatsArray,
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

    // Get orders with ingredient consumption logs (include both completed and preparing orders)
    const ordersWithConsumption = await Order.find({
      orderDate: { $gte: thirtyDaysAgo },
      orderStatus: { $in: ['completed', 'preparing'] }, // Include both statuses
      ingredientConsumption: { $exists: true, $ne: [] }
    });

    // Aggregate consumption by ingredient
    const consumptionByIngredient = {};
    
    ordersWithConsumption.forEach(order => {
      if (order.ingredientConsumption) {
        order.ingredientConsumption.forEach(log => {
          // Skip malformed entries
          if (!log.ingredient || log.ingredient === 'undefined' || log.consumed === undefined || log.consumed === null) {
            return;
          }
          
          if (!consumptionByIngredient[log.ingredient]) {
            consumptionByIngredient[log.ingredient] = {
              name: log.ingredient,
              totalConsumed: 0,
              unit: log.unit || 'units',
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
