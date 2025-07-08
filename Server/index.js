const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env variables first
dotenv.config();

const connectDB = require('./config/db');

// Ensure models are loaded/registered BEFORE routes that use them
require('./models/MenuItem'); // This ensures the MenuItem schema is registered with Mongoose
require('./models/AdminUser'); // This ensures the AdminUser schema is registered with Mongoose
require('./models/Customer'); // This ensures the Customer schema is registered with Mongoose
require('./models/PasswordReset'); // This ensures the PasswordReset schema is registered with Mongoose

// Now require routes (which in turn require controllers that use the models)
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Add this line
const orderRoutes = require('./routes/orderRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

const app = express(); // <-- Initialize app first
const server = http.createServer(app);

// Define allowed origins once
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
  'http://localhost:5173',
  'https://kahit-saan-client.onrender.com' // Your deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins from the local network and configured allowed origins
    const isAllowed = allowedOrigins.includes(origin) || /^(http:\/\/192\.168\.|http:\/\/localhost:)/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  },
  credentials: true,
};

// Use the same CORS options for both Express and Socket.IO
const io = new Server(server, {
  cors: corsOptions
});

app.set('socketio', io); // Make io accessible to our routes

// Connect Database
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Add this line
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerAuthRoutes); // Add this line for customer routes
app.use('/api/password-reset', passwordResetRoutes);

app.get('/', (req, res) => {
  res.send('Kahit Saan API is running...');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
