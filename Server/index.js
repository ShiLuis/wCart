const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env variables first
dotenv.config();

const connectDB = require('./config/db');

// Ensure models are loaded/registered BEFORE routes that use them
require('./models/MenuItem'); // This ensures the MenuItem schema is registered with Mongoose
require('./models/AdminUser'); // This ensures the AdminUser schema is registered with Mongoose
require('./models/Customer'); // This ensures the Customer schema is registered with Mongoose

// Now require routes (which in turn require controllers that use the models)
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Add this line
const orderRoutes = require('./routes/orderRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');

const app = express(); // <-- Initialize app first

// Connect Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
  'http://localhost:5173',
  'https://kahit-saan-client.onrender.com' // Your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins from the local network and configured allowed origins
    const isAllowed = allowedOrigins.includes(origin) || /^(http:\/\/192\.168\.|http:\/\/localhost:)/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  }
}));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Add this line
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerAuthRoutes); // Add this line for customer routes

app.get('/', (req, res) => {
  res.send('Kahit Saan API is running...');
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
