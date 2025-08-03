const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const Ingredient = require('../models/Ingredient');

async function testQueries() {
  try {
    console.log('🧪 Testing analytics queries...');
    
    const totalIngredients = await Ingredient.countDocuments({ isActive: true });
    const lowStockCount = await Ingredient.countDocuments({ stockStatus: 'low_stock' });
    const outOfStockCount = await Ingredient.countDocuments({ stockStatus: 'out_of_stock' });
    const inStockCount = await Ingredient.countDocuments({ stockStatus: 'in_stock' });
    
    console.log('Direct countDocuments results:');
    console.log(`   Total: ${totalIngredients}`);
    console.log(`   In Stock: ${inStockCount}`);
    console.log(`   Low Stock: ${lowStockCount}`);
    console.log(`   Out of Stock: ${outOfStockCount}`);
    
    // Let's also try a find query to see what's actually there
    const allIngredients = await Ingredient.find({ isActive: true }, { name: 1, stockStatus: 1 });
    console.log('\nActual ingredients and their status:');
    
    const statusCounts = { 'in_stock': 0, 'low_stock': 0, 'out_of_stock': 0, 'undefined': 0 };
    allIngredients.forEach(ing => {
      const status = ing.stockStatus || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      console.log(`   ${ing.name}: ${status}`);
    });
    
    console.log('\nCounted manually:');
    console.log(`   In Stock: ${statusCounts['in_stock']}`);
    console.log(`   Low Stock: ${statusCounts['low_stock']}`);
    console.log(`   Out of Stock: ${statusCounts['out_of_stock']}`);
    console.log(`   Undefined: ${statusCounts['undefined']}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTimeout(testQueries, 2000);
