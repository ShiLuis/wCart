const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');
require('dotenv').config();

async function investigateDataIssue() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Get one ingredient and examine its stockStatus in detail
    const oneIngredient = await Ingredient.findOne({});
    console.log('\n🔍 Detailed examination of one ingredient:');
    console.log('Name:', oneIngredient.name);
    console.log('stockStatus value:', JSON.stringify(oneIngredient.stockStatus));
    console.log('stockStatus type:', typeof oneIngredient.stockStatus);
    console.log('stockStatus length:', oneIngredient.stockStatus.length);
    console.log('stockStatus charCodes:', Array.from(oneIngredient.stockStatus).map(c => c.charCodeAt(0)));

    // Test exact match
    console.log('\n🔍 Testing exact string match:');
    const exactMatch = await Ingredient.find({ stockStatus: oneIngredient.stockStatus });
    console.log(`Find with exact value from DB: ${exactMatch.length}`);

    // Test with regex
    console.log('\n🔍 Testing with regex:');
    const regexMatch = await Ingredient.find({ stockStatus: /in_stock/ });
    console.log(`Find with regex /in_stock/: ${regexMatch.length}`);

    // Test with raw MongoDB query
    console.log('\n🔍 Testing with raw MongoDB collection:');
    const collection = mongoose.connection.collection('ingredients');
    const rawCount = await collection.countDocuments({ stockStatus: 'in_stock' });
    console.log(`Raw MongoDB count: ${rawCount}`);

    // Check the actual schema enum values
    console.log('\n📋 Schema enum values for stockStatus:');
    console.log(Ingredient.schema.paths.stockStatus.enumValues);

    // Try updating one ingredient to see if that fixes it
    console.log('\n🔧 Testing update on one ingredient:');
    const updateResult = await Ingredient.updateOne(
      { _id: oneIngredient._id },
      { stockStatus: 'in_stock' }
    );
    console.log('Update result:', updateResult);

    // Test count after update
    const countAfterUpdate = await Ingredient.countDocuments({ stockStatus: 'in_stock' });
    console.log(`Count after update: ${countAfterUpdate}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

investigateDataIssue();
