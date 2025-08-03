const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');
require('dotenv').config();

async function testCountQueries() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Test the exact same queries as the analytics controller
    console.log('\n🔍 Testing exact queries from analytics controller...');
    
    const totalIngredients = await Ingredient.countDocuments({ isActive: true });
    console.log(`Total active ingredients: ${totalIngredients}`);
    
    const lowStockCount = await Ingredient.countDocuments({ stockStatus: 'low_stock' });
    console.log(`Low stock count: ${lowStockCount}`);
    
    const outOfStockCount = await Ingredient.countDocuments({ stockStatus: 'out_of_stock' });
    console.log(`Out of stock count: ${outOfStockCount}`);
    
    const inStockCount = await Ingredient.countDocuments({ stockStatus: 'in_stock' });
    console.log(`In stock count: ${inStockCount}`);

    // Test with isActive filter too
    console.log('\n🔍 Testing with isActive filter...');
    const inStockActiveCount = await Ingredient.countDocuments({ 
      stockStatus: 'in_stock', 
      isActive: true 
    });
    console.log(`In stock & active count: ${inStockActiveCount}`);

    // Get a sample of ingredients to see their actual values
    console.log('\n📋 Sample of ingredients with their stockStatus:');
    const sampleIngredients = await Ingredient.find({}, 'name stockStatus isActive currentStock').limit(5);
    sampleIngredients.forEach(ing => {
      console.log(`  ${ing.name}: stockStatus="${ing.stockStatus}", isActive=${ing.isActive}, stock=${ing.currentStock}`);
    });

    // Test with find() instead of countDocuments()
    console.log('\n🔍 Testing with find() method...');
    const inStockIngredients = await Ingredient.find({ stockStatus: 'in_stock' });
    console.log(`Find in_stock count: ${inStockIngredients.length}`);

    // Check if there are any index issues
    console.log('\n📊 Raw data check...');
    const allIngredients = await Ingredient.find({}, 'name stockStatus');
    const statusCounts = {};
    allIngredients.forEach(ing => {
      const status = ing.stockStatus;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('Status distribution:', statusCounts);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCountQueries();
