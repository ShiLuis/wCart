const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerCustomer = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const exists = await Customer.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Customer already exists' });
    const customer = await Customer.create({ username, password, email });
    res.status(201).json({
      _id: customer._id,
      username: customer.username,
      email: customer.email,
      token: generateToken(customer._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during customer registration' });
  }
};

const loginCustomer = async (req, res) => {
  const { username, password } = req.body;
  try {
    const customer = await Customer.findOne({ username }).select('+password');
    if (customer && (await customer.matchPassword(password))) {
      res.json({
        _id: customer._id,
        username: customer.username,
        email: customer.email,
        token: generateToken(customer._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during customer login' });
  }
};

module.exports = { registerCustomer, loginCustomer };
