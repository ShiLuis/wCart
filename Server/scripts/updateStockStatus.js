const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const Ingredient = require('../models/Ingredient');

async function updateStockStatuses() {
  try {
    console.log('🔄 Updating stock statuses for all ingredients...');
    
    const ingredients = await Ingredient.find({});
    console.log(`Found ${ingredients.length} ingredients to update`);
    
    let updated = 0;
    
    for (const ingredient of ingredients) {
      const oldStatus = ingredient.stockStatus;
      
      // Manually calculate stock status
      if (ingredient.currentStock <= 0) {
        ingredient.stockStatus = 'out_of_stock';
      } else if (ingredient.currentStock <= ingredient.minStockLevel) {
        ingredient.stockStatus = 'low_stock';
      } else {
        ingredient.stockStatus = 'in_stock';
      }
      
      if (oldStatus !== ingredient.stockStatus) {
        await ingredient.save();
        console.log(`✅ Updated ${ingredient.name}: ${oldStatus} → ${ingredient.stockStatus} (Stock: ${ingredient.currentStock}, Min: ${ingredient.minStockLevel})`);
        updated++;
      } else {
        console.log(`⚪ ${ingredient.name}: ${ingredient.stockStatus} (Stock: ${ingredient.currentStock}, Min: ${ingredient.minStockLevel})`);
      }
    }
    
    console.log(`\n🎉 Updated ${updated} ingredients`);
    
    // Test the counts
    const inStockCount = await Ingredient.countDocuments({ stockStatus: 'in_stock' });
    const lowStockCount = await Ingredient.countDocuments({ stockStatus: 'low_stock' });
    const outOfStockCount = await Ingredient.countDocuments({ stockStatus: 'out_of_stock' });
    
    console.log(`\n📊 Final counts:`);
    console.log(`   In Stock: ${inStockCount}`);
    console.log(`   Low Stock: ${lowStockCount}`);
    console.log(`   Out of Stock: ${outOfStockCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTimeout(updateStockStatuses, 2000);
