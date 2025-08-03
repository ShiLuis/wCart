const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');

// Actual menu item ingredients based on the restaurant's menu
const menuIngredients = {
  "Katsudon Chaofan": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Chicken Breast", quantity: 0.15, unit: "kg" },
    { name: "Eggs", quantity: 1, unit: "pieces" },
    { name: "Onions", quantity: 0.05, unit: "kg" }
  ],
  "HOTDOG CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Chinese Sausage (Lap Cheong)", quantity: 3, unit: "pieces" },
    { name: "Eggs", quantity: 1, unit: "pieces" },
    { name: "Carrots", quantity: 0.03, unit: "kg" }
  ],
  "TONKATSU CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Pork Belly", quantity: 0.15, unit: "kg" },
    { name: "Eggs", quantity: 1, unit: "pieces" },
    { name: "Cabbage", quantity: 0.05, unit: "kg" }
  ],
  "SWEET & SOUR CHICKEN CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Chicken Breast", quantity: 0.15, unit: "kg" },
    { name: "Bell Peppers", quantity: 0.05, unit: "kg" },
    { name: "Onions", quantity: 0.05, unit: "kg" }
  ],
  "SHARKSFIN CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Eggs", quantity: 2, unit: "pieces" },
    { name: "Bean Sprouts", quantity: 0.05, unit: "kg" },
    { name: "Carrots", quantity: 0.03, unit: "kg" }
  ],
  "LAKSA NOODLES": [
    { name: "Pasta - Spaghetti", quantity: 0.15, unit: "kg" },
    { name: "Shrimp", quantity: 0.08, unit: "kg" },
    { name: "Bean Sprouts", quantity: 0.05, unit: "kg" },
    { name: "Eggs", quantity: 1, unit: "pieces" }
  ],
  "LECHON KAWALI CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Pork Belly", quantity: 0.18, unit: "kg" },
    { name: "Garlic", quantity: 0.01, unit: "kg" },
    { name: "Onions", quantity: 0.05, unit: "kg" }
  ],
  "TOKWA'T BABOY CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Pork Belly", quantity: 0.1, unit: "kg" },
    { name: "Tofu", quantity: 0.1, unit: "kg" },
    { name: "Onions", quantity: 0.05, unit: "kg" }
  ],
  "SHANGHAI CHAO FAN": [
    { name: "Rice", quantity: 0.2, unit: "kg" },
    { name: "Eggs", quantity: 2, unit: "pieces" },
    { name: "Chinese Sausage (Lap Cheong)", quantity: 2, unit: "pieces" },
    { name: "Carrots", quantity: 0.03, unit: "kg" }
  ],
  "CUCUMBER LEMONADE": [
    // No ingredients needed for beverages in inventory
  ],
  "ICED TEA": [
    // No ingredients needed for beverages in inventory
  ]
};

async function addIngredientsToMenu() {
  try {
    console.log('🍽️ Adding ingredients to existing menu items...');
    
    // Get all menu items
    const menuItems = await MenuItem.find({});
    console.log(`Found ${menuItems.length} menu items`);
    
    // Get all ingredients for reference
    const ingredients = await Ingredient.find({});
    const ingredientMap = {};
    ingredients.forEach(ing => {
      ingredientMap[ing.name] = ing._id;
    });
    
    console.log(`Found ${ingredients.length} ingredients in database`);
    
    for (const menuItem of menuItems) {
      console.log(`\n📝 Processing: ${menuItem.name}`);
      
      // Check if menu item already has ingredients
      if (menuItem.ingredients && menuItem.ingredients.length > 0) {
        console.log(`   ⚠️ Already has ${menuItem.ingredients.length} ingredients, skipping`);
        continue;
      }
      
      // Find matching recipe
      const recipe = menuIngredients[menuItem.name];
      if (!recipe) {
        console.log(`   ❌ No recipe found for "${menuItem.name}"`);
        continue;
      }
      
      // Add ingredients to menu item
      const ingredientsList = [];
      for (const recipeIngredient of recipe) {
        const ingredientId = ingredientMap[recipeIngredient.name];
        if (ingredientId) {
          ingredientsList.push({
            ingredient: ingredientId,
            quantity: recipeIngredient.quantity,
            unit: recipeIngredient.unit
          });
          console.log(`   ✅ Added: ${recipeIngredient.quantity} ${recipeIngredient.unit} of ${recipeIngredient.name}`);
        } else {
          console.log(`   ⚠️ Ingredient not found: ${recipeIngredient.name}`);
        }
      }
      
      // Update menu item
      if (ingredientsList.length > 0) {
        menuItem.ingredients = ingredientsList;
        await menuItem.save();
        console.log(`   💾 Updated "${menuItem.name}" with ${ingredientsList.length} ingredients`);
      }
    }
    
    console.log('\n🎉 Finished adding ingredients to menu items!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTimeout(addIngredientsToMenu, 2000); // Wait for DB connection
