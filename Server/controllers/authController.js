const mongoose = require('mongoose');
const AdminUser = mongoose.model('AdminUser'); // Assuming models are registered
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Optional: Register Admin (usually done once manually or via a protected seed script)
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const adminExists = await mongoose.model('AdminUser').findOne({ username });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }
    const admin = await mongoose.model('AdminUser').create({ username, password });
    if (admin) {
      res.status(201).json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await mongoose.model('AdminUser').findOne({ username }).select('+password');
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

module.exports = { registerAdmin, loginAdmin };