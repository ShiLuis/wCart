const mongoose = require('mongoose');
const MenuItem = mongoose.model('MenuItem'); // Assuming models are registered
const cloudinary = require('../config/cloudinaryConfig'); // Assuming config is set up

const getMenuItems = async (req, res) => {
  try {
    const items = await mongoose.model('MenuItem').find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const item = await mongoose.model('MenuItem').findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    console.error(`Error fetching menu item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMenuItem = async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;
  try {
    let photoData = {};
    if (req.file) {
      // Upload image to Cloudinary from buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'kahit_saan_menu' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      photoData = { url: result.secure_url, public_id: result.public_id };
    }

    const newItem = new (mongoose.model('MenuItem'))({
      name,
      description,
      price,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      photo: photoData.url ? photoData : undefined, // Only save photo if URL exists
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Server error creating menu item', error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;
  try {
    const item = await mongoose.model('MenuItem').findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    let photoData = item.photo; // Keep existing photo by default

    if (req.file) {
      // If there's an old photo in Cloudinary, attempt to delete it
      if (item.photo && item.photo.public_id) {
        try {
          await cloudinary.uploader.destroy(item.photo.public_id);
        } catch (err) {
          console.warn("Failed to delete old image from Cloudinary:", err.message);
        }
      }
      // Upload new photo
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'kahit_saan_menu' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      photoData = { url: result.secure_url, public_id: result.public_id };
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price !== undefined ? price : item.price;
    item.category = category || item.category;
    item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;
    item.photo = photoData;
    item.updatedAt = Date.now();

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error(`Error updating menu item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error updating menu item', error: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await mongoose.model('MenuItem').findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    // Delete image from Cloudinary if it exists
    if (item.photo && item.photo.public_id) {
      try {
        await cloudinary.uploader.destroy(item.photo.public_id);
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary during menu item deletion:", err.message);
      }
    }
    await mongoose.model('MenuItem').findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item removed successfully' });
  } catch (error) {
    console.error(`Error deleting menu item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
