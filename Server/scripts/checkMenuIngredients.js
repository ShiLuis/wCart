const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');
require('dotenv').config();

async function checkMenuIngredients() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const menuItems = await MenuItem.find({}).populate('ingredients.ingredient');
    
    console.log(`\n📋 Found ${menuItems.length} menu items:\n`);
    
    menuItems.forEach(item => {
      console.log(`🍽️  ${item.name} (${item.category})`);
      console.log(`   Price: ₱${item.price}`);
      console.log(`   Ingredients: ${item.ingredients.length}`);
      
      if (item.ingredients.length > 0) {
        item.ingredients.forEach(ing => {
          const ingredientName = ing.ingredient ? ing.ingredient.name : 'MISSING INGREDIENT';
          console.log(`     - ${ing.quantity} ${ing.unit || 'units'} of ${ingredientName}`);
        });
      } else {
        console.log(`     ⚠️  NO INGREDIENTS DEFINED`);
      }
      console.log('');
    });

    console.log('\n📊 Summary:');
    const itemsWithIngredients = menuItems.filter(item => item.ingredients.length > 0);
    const itemsWithoutIngredients = menuItems.filter(item => item.ingredients.length === 0);
    
    console.log(`   Items WITH ingredients: ${itemsWithIngredients.length}`);
    console.log(`   Items WITHOUT ingredients: ${itemsWithoutIngredients.length}`);
    
    if (itemsWithoutIngredients.length > 0) {
      console.log('\n⚠️  Items missing ingredients:');
      itemsWithoutIngredients.forEach(item => {
        console.log(`     - ${item.name}`);
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMenuIngredients();
