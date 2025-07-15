const mongoose = require('mongoose');
require('../config/db');

const Ingredient = require('../models/Ingredient');

// Comprehensive ingredient list for a restaurant
const ingredients = [
  // MEAT
  { name: 'Chicken Breast', category: 'meat', currentStock: 50, unit: 'kg', minStockLevel: 10, maxStockLevel: 100, costPerUnit: 180, supplier: { name: 'Metro Meat Suppliers', contact: '09123456789', email: 'metro@meatsuppliers.com' } },
  { name: 'Chicken Thigh', category: 'meat', currentStock: 30, unit: 'kg', minStockLevel: 8, maxStockLevel: 80, costPerUnit: 160, supplier: { name: 'Metro Meat Suppliers', contact: '09123456789', email: 'metro@meatsuppliers.com' } },
  { name: 'Ground Beef', category: 'meat', currentStock: 25, unit: 'kg', minStockLevel: 5, maxStockLevel: 50, costPerUnit: 350, supplier: { name: 'Prime Beef Co.', contact: '09987654321', email: 'orders@primebeef.ph' } },
  { name: 'Pork Belly', category: 'meat', currentStock: 20, unit: 'kg', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 280, supplier: { name: 'Fresh Pork Manila', contact: '09111222333', email: 'supply@freshpork.ph' } },
  { name: 'Pork Shoulder', category: 'meat', currentStock: 15, unit: 'kg', minStockLevel: 5, maxStockLevel: 30, costPerUnit: 250, supplier: { name: 'Fresh Pork Manila', contact: '09111222333', email: 'supply@freshpork.ph' } },
  { name: 'Bacon', category: 'meat', currentStock: 12, unit: 'kg', minStockLevel: 3, maxStockLevel: 25, costPerUnit: 450, supplier: { name: 'Premium Meats Inc.', contact: '09444555666', email: 'info@premiummeats.com' } },

  // SEAFOOD
  { name: 'Shrimp', category: 'seafood', currentStock: 8, unit: 'kg', minStockLevel: 2, maxStockLevel: 20, costPerUnit: 650, supplier: { name: 'Ocean Fresh Seafood', contact: '09777888999', email: 'orders@oceanfresh.ph' } },
  { name: 'Salmon Fillet', category: 'seafood', currentStock: 5, unit: 'kg', minStockLevel: 2, maxStockLevel: 15, costPerUnit: 850, supplier: { name: 'Premium Seafood Trading', contact: '09222333444', email: 'sales@premiumseafood.com' } },
  { name: 'Tuna', category: 'seafood', currentStock: 10, unit: 'kg', minStockLevel: 3, maxStockLevel: 25, costPerUnit: 400, supplier: { name: 'Ocean Fresh Seafood', contact: '09777888999', email: 'orders@oceanfresh.ph' } },

  // VEGETABLES
  { name: 'Onions', category: 'vegetable', currentStock: 40, unit: 'kg', minStockLevel: 10, maxStockLevel: 80, costPerUnit: 45, supplier: { name: 'Fresh Veggies Market', contact: '09555666777', email: 'orders@freshveggies.ph' } },
  { name: 'Garlic', category: 'vegetable', currentStock: 15, unit: 'kg', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 120, supplier: { name: 'Fresh Veggies Market', contact: '09555666777', email: 'orders@freshveggies.ph' } },
  { name: 'Tomatoes', category: 'vegetable', currentStock: 25, unit: 'kg', minStockLevel: 8, maxStockLevel: 50, costPerUnit: 60, supplier: { name: 'Farm Fresh Produce', contact: '09888999000', email: 'supply@farmfresh.com' } },
  { name: 'Bell Peppers', category: 'vegetable', currentStock: 18, unit: 'kg', minStockLevel: 5, maxStockLevel: 35, costPerUnit: 85, supplier: { name: 'Fresh Veggies Market', contact: '09555666777', email: 'orders@freshveggies.ph' } },
  { name: 'Mushrooms', category: 'vegetable', currentStock: 12, unit: 'kg', minStockLevel: 3, maxStockLevel: 25, costPerUnit: 150, supplier: { name: 'Metro Mushroom Farm', contact: '09333444555', email: 'info@metromushroom.ph' } },
  { name: 'Lettuce', category: 'vegetable', currentStock: 20, unit: 'pieces', minStockLevel: 10, maxStockLevel: 50, costPerUnit: 35, supplier: { name: 'Green Leaf Suppliers', contact: '09666777888', email: 'orders@greenleaf.ph' } },
  { name: 'Carrots', category: 'vegetable', currentStock: 22, unit: 'kg', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 55, supplier: { name: 'Farm Fresh Produce', contact: '09888999000', email: 'supply@farmfresh.com' } },
  { name: 'Potatoes', category: 'vegetable', currentStock: 50, unit: 'kg', minStockLevel: 15, maxStockLevel: 100, costPerUnit: 35, supplier: { name: 'Mountain Fresh Potatoes', contact: '09111000999', email: 'sales@mountainfresh.ph' } },
  { name: 'Cabbage', category: 'vegetable', currentStock: 25, unit: 'pieces', minStockLevel: 8, maxStockLevel: 50, costPerUnit: 45, supplier: { name: 'Green Leaf Suppliers', contact: '09666777888', email: 'orders@greenleaf.ph' } },

  // DAIRY
  { name: 'Mozzarella Cheese', category: 'dairy', currentStock: 15, unit: 'kg', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 480, supplier: { name: 'Dairy Best Philippines', contact: '09222111000', email: 'orders@dairybest.ph' } },
  { name: 'Cheddar Cheese', category: 'dairy', currentStock: 12, unit: 'kg', minStockLevel: 3, maxStockLevel: 25, costPerUnit: 520, supplier: { name: 'Dairy Best Philippines', contact: '09222111000', email: 'orders@dairybest.ph' } },
  { name: 'Butter', category: 'dairy', currentStock: 10, unit: 'kg', minStockLevel: 2, maxStockLevel: 20, costPerUnit: 350, supplier: { name: 'Golden Dairy Co.', contact: '09444333222', email: 'supply@goldendairy.com' } },
  { name: 'Heavy Cream', category: 'dairy', currentStock: 8, unit: 'l', minStockLevel: 2, maxStockLevel: 20, costPerUnit: 280, supplier: { name: 'Premium Dairy Solutions', contact: '09777666555', email: 'info@premiumdairy.ph' } },
  { name: 'Milk', category: 'dairy', currentStock: 20, unit: 'l', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 65, supplier: { name: 'Fresh Milk Direct', contact: '09888777666', email: 'orders@freshmilk.ph' } },

  // GRAINS & CARBS
  { name: 'Rice', category: 'grain', currentStock: 100, unit: 'kg', minStockLevel: 25, maxStockLevel: 200, costPerUnit: 45, supplier: { name: 'Rice Masters Philippines', contact: '09111222444', email: 'bulk@ricemasters.ph' } },
  { name: 'Pasta - Spaghetti', category: 'grain', currentStock: 25, unit: 'kg', minStockLevel: 5, maxStockLevel: 50, costPerUnit: 120, supplier: { name: 'Pasta Italiano Trading', contact: '09333555777', email: 'orders@pastaitaliano.com' } },
  { name: 'Pasta - Penne', category: 'grain', currentStock: 20, unit: 'kg', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 125, supplier: { name: 'Pasta Italiano Trading', contact: '09333555777', email: 'orders@pastaitaliano.com' } },
  { name: 'Bread Flour', category: 'grain', currentStock: 30, unit: 'kg', minStockLevel: 8, maxStockLevel: 60, costPerUnit: 55, supplier: { name: 'Flour Mills International', contact: '09666444222', email: 'supply@flourmills.ph' } },
  { name: 'All Purpose Flour', category: 'grain', currentStock: 25, unit: 'kg', minStockLevel: 8, maxStockLevel: 50, costPerUnit: 50, supplier: { name: 'Flour Mills International', contact: '09666444222', email: 'supply@flourmills.ph' } },

  // SAUCES & CONDIMENTS
  { name: 'Soy Sauce', category: 'sauce', currentStock: 15, unit: 'l', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 180, supplier: { name: 'Asian Sauce Company', contact: '09999888777', email: 'orders@asiansauce.ph' } },
  { name: 'Oyster Sauce', category: 'sauce', currentStock: 12, unit: 'l', minStockLevel: 3, maxStockLevel: 25, costPerUnit: 220, supplier: { name: 'Asian Sauce Company', contact: '09999888777', email: 'orders@asiansauce.ph' } },
  { name: 'Tomato Sauce', category: 'sauce', currentStock: 20, unit: 'l', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 95, supplier: { name: 'Sauce Masters Inc.', contact: '09111777888', email: 'bulk@saucemasters.com' } },
  { name: 'Ketchup', category: 'sauce', currentStock: 18, unit: 'l', minStockLevel: 5, maxStockLevel: 35, costPerUnit: 120, supplier: { name: 'Condiment Solutions', contact: '09444888999', email: 'orders@condiments.ph' } },
  { name: 'Mayonnaise', category: 'sauce', currentStock: 15, unit: 'l', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 160, supplier: { name: 'Condiment Solutions', contact: '09444888999', email: 'orders@condiments.ph' } },

  // SPICES & SEASONINGS
  { name: 'Salt', category: 'spice', currentStock: 20, unit: 'kg', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 25, supplier: { name: 'Spice World Trading', contact: '09222666888', email: 'wholesale@spiceworld.ph' } },
  { name: 'Black Pepper', category: 'spice', currentStock: 5, unit: 'kg', minStockLevel: 1, maxStockLevel: 10, costPerUnit: 450, supplier: { name: 'Premium Spices Co.', contact: '09777333444', email: 'orders@premiumspices.com' } },
  { name: 'Paprika', category: 'spice', currentStock: 3, unit: 'kg', minStockLevel: 0.5, maxStockLevel: 6, costPerUnit: 680, supplier: { name: 'Exotic Spice House', contact: '09555888111', email: 'info@exoticspice.ph' } },
  { name: 'Oregano', category: 'spice', currentStock: 2, unit: 'kg', minStockLevel: 0.5, maxStockLevel: 4, costPerUnit: 850, supplier: { name: 'Herb & Spice Gallery', contact: '09333999666', email: 'orders@herbspice.com' } },
  { name: 'Basil (Dried)', category: 'spice', currentStock: 1.5, unit: 'kg', minStockLevel: 0.3, maxStockLevel: 3, costPerUnit: 920, supplier: { name: 'Herb & Spice Gallery', contact: '09333999666', email: 'orders@herbspice.com' } },
  { name: 'Garlic Powder', category: 'spice', currentStock: 4, unit: 'kg', minStockLevel: 1, maxStockLevel: 8, costPerUnit: 380, supplier: { name: 'Spice World Trading', contact: '09222666888', email: 'wholesale@spiceworld.ph' } },

  // OILS & FATS
  { name: 'Vegetable Oil', category: 'other', currentStock: 40, unit: 'l', minStockLevel: 10, maxStockLevel: 80, costPerUnit: 85, supplier: { name: 'Golden Oil Industries', contact: '09666333777', email: 'bulk@goldenoil.ph' } },
  { name: 'Olive Oil', category: 'other', currentStock: 15, unit: 'l', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 450, supplier: { name: 'Mediterranean Imports', contact: '09888444555', email: 'orders@mediterranean.ph' } },
  { name: 'Sesame Oil', category: 'other', currentStock: 8, unit: 'l', minStockLevel: 2, maxStockLevel: 15, costPerUnit: 380, supplier: { name: 'Asian Specialty Oils', contact: '09111555999', email: 'supply@asianspecialty.com' } },

  // BEVERAGES
  { name: 'Coffee Beans', category: 'beverage', currentStock: 20, unit: 'kg', minStockLevel: 5, maxStockLevel: 40, costPerUnit: 450, supplier: { name: 'Philippine Coffee Roasters', contact: '09777222666', email: 'wholesale@coffeeroasters.ph' } },
  { name: 'Tea Leaves', category: 'beverage', currentStock: 10, unit: 'kg', minStockLevel: 2, maxStockLevel: 20, costPerUnit: 380, supplier: { name: 'Asian Tea Company', contact: '09444777111', email: 'orders@asiantea.ph' } },
  { name: 'Sugar', category: 'other', currentStock: 30, unit: 'kg', minStockLevel: 8, maxStockLevel: 60, costPerUnit: 55, supplier: { name: 'Sweet Solutions Inc.', contact: '09222888333', email: 'bulk@sweetsolutions.com' } },

  // FRESH HERBS
  { name: 'Fresh Basil', category: 'vegetable', currentStock: 2, unit: 'kg', minStockLevel: 0.5, maxStockLevel: 5, costPerUnit: 450, supplier: { name: 'Fresh Herbs Farm', contact: '09999111444', email: 'orders@freshherbs.ph' } },
  { name: 'Fresh Parsley', category: 'vegetable', currentStock: 1.5, unit: 'kg', minStockLevel: 0.3, maxStockLevel: 3, costPerUnit: 380, supplier: { name: 'Fresh Herbs Farm', contact: '09999111444', email: 'orders@freshherbs.ph' } },
  { name: 'Fresh Cilantro', category: 'vegetable', currentStock: 1.8, unit: 'kg', minStockLevel: 0.5, maxStockLevel: 4, costPerUnit: 320, supplier: { name: 'Fresh Herbs Farm', contact: '09999111444', email: 'orders@freshherbs.ph' } },

  // EGGS & PROTEINS
  { name: 'Eggs', category: 'other', currentStock: 200, unit: 'pieces', minStockLevel: 50, maxStockLevel: 500, costPerUnit: 8, supplier: { name: 'Fresh Eggs Daily', contact: '09555222777', email: 'orders@fresheggs.ph' } },
  { name: 'Tofu', category: 'other', currentStock: 15, unit: 'kg', minStockLevel: 3, maxStockLevel: 30, costPerUnit: 85, supplier: { name: 'Healthy Protein Co.', contact: '09888555222', email: 'supply@healthyprotein.ph' } }
];

async function seedInventory() {
  try {
    console.log('🌱 Starting inventory seeding...');
    
    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log('🗑️  Cleared existing ingredients');
    
    // Insert new ingredients
    const insertedIngredients = await Ingredient.insertMany(ingredients);
    console.log(`✅ Successfully inserted ${insertedIngredients.length} ingredients`);
    
    // Display summary
    const summary = {};
    insertedIngredients.forEach(ingredient => {
      if (!summary[ingredient.category]) {
        summary[ingredient.category] = 0;
      }
      summary[ingredient.category]++;
    });
    
    console.log('\n📊 Inventory Summary by Category:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });
    
    // Calculate total inventory value
    const totalValue = insertedIngredients.reduce((sum, ingredient) => {
      return sum + (ingredient.currentStock * ingredient.costPerUnit);
    }, 0);
    
    console.log(`\n💰 Total Inventory Value: ₱${totalValue.toLocaleString()}`);
    console.log('\n🎉 Inventory seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

// Connect to database and seed
seedInventory();
