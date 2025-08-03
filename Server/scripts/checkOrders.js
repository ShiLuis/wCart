const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

async function checkOrdersAndConsumption() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Check recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber items orderStatus ingredientConsumption orderDate');

    console.log(`\n📋 Found ${recentOrders.length} recent orders:\n`);
    
    recentOrders.forEach((order, index) => {
      console.log(`🛍️  Order ${index + 1}: ${order.orderNumber || order._id}`);
      console.log(`   Status: ${order.orderStatus}`);
      console.log(`   Date: ${order.orderDate}`);
      console.log(`   Items: ${order.items.length}`);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          console.log(`     - ${item.quantity || item.qty || 1}x ${item.name} (₱${item.price})`);
        });
      }
      
      console.log(`   Consumption Data: ${order.ingredientConsumption ? order.ingredientConsumption.length + ' entries' : 'None'}`);
      
      if (order.ingredientConsumption && order.ingredientConsumption.length > 0) {
        console.log('   📊 Consumption Details:');
        order.ingredientConsumption.forEach(consumption => {
          console.log(`     - ${consumption.ingredient}: ${consumption.consumed} ${consumption.unit || 'units'}`);
        });
      }
      console.log('');
    });

    // Check consumption analytics specifically
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    const ordersWithConsumption = await Order.find({
      orderDate: { $gte: thirtyDaysAgo },
      orderStatus: 'completed',
      ingredientConsumption: { $exists: true, $ne: [] }
    });

    console.log(`\n🔍 Analysis for last 30 days:`);
    console.log(`   Orders with consumption data: ${ordersWithConsumption.length}`);
    
    if (ordersWithConsumption.length > 0) {
      console.log('\n📊 Sample consumption data:');
      const sampleOrder = ordersWithConsumption[0];
      console.log(`   Sample order: ${sampleOrder.orderNumber || sampleOrder._id}`);
      console.log(`   Consumption entries: ${sampleOrder.ingredientConsumption.length}`);
      
      if (sampleOrder.ingredientConsumption.length > 0) {
        sampleOrder.ingredientConsumption.slice(0, 3).forEach(consumption => {
          console.log(`     - Ingredient: "${consumption.ingredient}"`);
          console.log(`       Consumed: ${consumption.consumed} (type: ${typeof consumption.consumed})`);
          console.log(`       Unit: "${consumption.unit}"`);
          console.log('');
        });
      }
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrdersAndConsumption();
