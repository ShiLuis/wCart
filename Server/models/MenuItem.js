const mongoose = require('mongoose'); // Add this line

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  photo: {
    url: { type: String, default: 'https://placehold.co/600x400/1A1A1A/D4AF37?text=No+Image+Provided' },
    public_id: { type: String }, // For Cloudinary asset management
  },
  category: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  // NEW: Ingredients and inventory tracking
  ingredients: [{
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    }
  }],
  // Auto-availability based on ingredient stock
  autoManageAvailability: {
    type: Boolean,
    default: true
  },
  // Manual override for availability
  manuallyDisabled: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if item can be made based on ingredient availability
menuItemSchema.methods.checkAvailability = async function() {
  if (this.manuallyDisabled) {
    this.isAvailable = false;
    return false;
  }

  if (!this.autoManageAvailability) {
    return this.isAvailable;
  }

  // If ingredients aren't populated, populate them
  if (this.ingredients.length > 0 && !this.ingredients[0].ingredient.name) {
    await this.populate('ingredients.ingredient');
  }

  const Ingredient = mongoose.model('Ingredient');
  
  for (let recipeIngredient of this.ingredients) {
    let ingredient = recipeIngredient.ingredient;
    
    // If ingredient is still just an ID, fetch it
    if (!ingredient.name) {
      ingredient = await Ingredient.findById(recipeIngredient.ingredient);
    }
    
    if (!ingredient || ingredient.currentStock < recipeIngredient.quantity) {
      this.isAvailable = false;
      return false;
    }
  }
  
  this.isAvailable = true;
  return true;
};

// Static method to update all menu items availability
menuItemSchema.statics.updateAllAvailability = async function() {
  try {
    const items = await this.find({ autoManageAvailability: true }).populate('ingredients.ingredient');
    const updatePromises = items.map(async (item) => {
      const wasAvailable = item.isAvailable;
      await item.checkAvailability();
      
      // Only save if availability changed
      if (wasAvailable !== item.isAvailable) {
        console.log(`Menu item "${item.name}" availability changed: ${wasAvailable} → ${item.isAvailable}`);
        return item.save();
      }
      return item;
    });
    await Promise.all(updatePromises);
    console.log('All menu item availabilities updated');
  } catch (error) {
    console.error('Error updating menu availability:', error);
    throw error;
  }
};

module.exports = mongoose.model('MenuItem', menuItemSchema);