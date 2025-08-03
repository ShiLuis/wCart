const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

// Sample ingredients to add
const sampleIngredients = [
  {
    name: 'All-purpose Flour',
    category: 'grain',
    currentStock: 25,
    unit: 'kg',
    minStockLevel: 5,
    maxStockLevel: 50,
    costPerUnit: 50
  },
  {
    name: 'Bean Sprouts',
    category: 'vegetable',
    currentStock: 15,
    unit: 'kg',
    minStockLevel: 3,
    maxStockLevel: 30,
    costPerUnit: 60
  },
  {
    name: 'Cabbage',
    category: 'vegetable',
    currentStock: 20,
    unit: 'pieces',
    minStockLevel: 5,
    maxStockLevel: 40,
    costPerUnit: 67
  },
  {
    name: 'Carrots',
    category: 'vegetable',
    currentStock: 30,
    unit: 'kg',
    minStockLevel: 5,
    maxStockLevel: 60,
    costPerUnit: 60
  },
  {
    name: 'Chicken Breast',
    category: 'meat',
    currentStock: 25,
    unit: 'kg',
    minStockLevel: 5,
    maxStockLevel: 50,
    costPerUnit: 280
  },
  {
    name: 'Chinese Sausage (Lap Cheong)',
    category: 'meat',
    currentStock: 50,
    unit: 'pieces',
    minStockLevel: 10,
    maxStockLevel: 100,
    costPerUnit: 25
  }
];

async function addIngredients() {
  try {
    console.log('🌱 Adding sample ingredients...');
    
    for (const ingredient of sampleIngredients) {
      try {
        const response = await axios.post(`${API_BASE}/inventory/ingredients`, ingredient, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Added: ${ingredient.name} - ${ingredient.currentStock} ${ingredient.unit}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Skipped: ${ingredient.name} (already exists)`);
        } else {
          console.error(`❌ Failed to add ${ingredient.name}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n📊 Checking inventory dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE}/inventory/dashboard`);
    console.log('Dashboard data:', dashboardResponse.data);
    
    console.log('\n🎉 Sample ingredients added successfully!');
  } catch (error) {
    console.error('❌ Error adding ingredients:', error.message);
  }
}

addIngredients();
