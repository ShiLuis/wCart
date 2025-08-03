const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');
require('dotenv').config();

async function addCompleteIngredients() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Get all ingredients for reference
    const ingredients = await Ingredient.find({ isActive: true });
    const ingredientMap = {};
    ingredients.forEach(ing => {
      ingredientMap[ing.name] = ing._id;
    });

    console.log('Available ingredients:', Object.keys(ingredientMap).sort());

    // Complete ingredient recipes for each menu item
    const completeRecipes = {
      'HOTDOG CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Hotdog', quantity: 2, unit: 'pieces' },
        { ingredient: 'Chinese Sausage (Lap Cheong)', quantity: 3, unit: 'pieces' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Carrots', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],
      
      'TONKATSU CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Pork Cutlet', quantity: 0.15, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Cabbage', quantity: 0.05, unit: 'kg' },
        { ingredient: 'Carrots', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Tonkatsu Sauce', quantity: 0.03, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'Katsudon Chaofan': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Chicken Breast', quantity: 0.15, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 2, unit: 'pieces' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Panko Breadcrumbs', quantity: 0.05, unit: 'kg' },
        { ingredient: 'All-purpose Flour', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Vegetable Oil', quantity: 0.05, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'SWEET & SOUR CHICKEN CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Chicken Breast', quantity: 0.15, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Carrots', quantity: 0.04, unit: 'kg' },
        { ingredient: 'Green Peas', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Ginger', quantity: 0.005, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'SHARKSFIN CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 2, unit: 'pieces' },
        { ingredient: 'Bean Sprouts', quantity: 0.05, unit: 'kg' },
        { ingredient: 'Carrots', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Sesame Oil', quantity: 0.01, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'LECHON KAWALI CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Pork Belly', quantity: 0.18, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      "TOKWA'T BABOY CHAO FAN": [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Pork Belly', quantity: 0.1, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.025, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'SHANGHAI CHAO FAN': [
        { ingredient: 'Day-old Cooked Rice', quantity: 0.25, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 2, unit: 'pieces' },
        { ingredient: 'Chinese Sausage (Lap Cheong)', quantity: 2, unit: 'pieces' },
        { ingredient: 'Carrots', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Soy Sauce', quantity: 0.02, unit: 'l' },
        { ingredient: 'Vegetable Oil', quantity: 0.03, unit: 'l' },
        { ingredient: 'Salt', quantity: 0.005, unit: 'kg' },
        { ingredient: 'White Pepper', quantity: 0.002, unit: 'kg' }
      ],

      'LAKSA NOODLES': [
        { ingredient: 'Rice Noodles', quantity: 0.2, unit: 'kg' },
        { ingredient: 'Shrimp', quantity: 0.08, unit: 'kg' },
        { ingredient: 'Bean Sprouts', quantity: 0.05, unit: 'kg' },
        { ingredient: 'Eggs', quantity: 1, unit: 'pieces' },
        { ingredient: 'Coconut Milk', quantity: 0.15, unit: 'l' },
        { ingredient: 'Laksa Paste', quantity: 0.03, unit: 'kg' },
        { ingredient: 'Green Onions', quantity: 0.02, unit: 'kg' },
        { ingredient: 'Garlic', quantity: 0.01, unit: 'kg' },
        { ingredient: 'Ginger', quantity: 0.005, unit: 'kg' },
        { ingredient: 'Vegetable Oil', quantity: 0.02, unit: 'l' }
      ],

      'CUCUMBER LEMONADE': [
        { ingredient: 'Iced Tea', quantity: 0.3, unit: 'l' }
      ],

      'ICED TEA': [
        { ingredient: 'Iced Tea', quantity: 0.3, unit: 'l' }
      ]
    };

    // Update each menu item with complete ingredients
    for (const [menuItemName, recipe] of Object.entries(completeRecipes)) {
      console.log(`\n🍽️  Updating ${menuItemName}...`);
      
      const menuItem = await MenuItem.findOne({ name: menuItemName });
      if (!menuItem) {
        console.log(`   ❌ Menu item not found: ${menuItemName}`);
        continue;
      }

      // Build ingredients array with proper ObjectIds
      const ingredientsList = [];
      for (const recipeItem of recipe) {
        const ingredientId = ingredientMap[recipeItem.ingredient];
        if (ingredientId) {
          ingredientsList.push({
            ingredient: ingredientId,
            quantity: recipeItem.quantity,
            unit: recipeItem.unit
          });
          console.log(`     ✅ Added: ${recipeItem.quantity} ${recipeItem.unit} of ${recipeItem.ingredient}`);
        } else {
          console.log(`     ❌ Ingredient not found: ${recipeItem.ingredient}`);
        }
      }

      // Update the menu item
      menuItem.ingredients = ingredientsList;
      await menuItem.save();
      console.log(`   📋 Updated with ${ingredientsList.length} ingredients`);
    }

    console.log('\n✅ All menu items updated with complete ingredient recipes!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCompleteIngredients();
