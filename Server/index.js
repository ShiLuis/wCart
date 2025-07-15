const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');
const { setIO } = require('./config/socket');

// Load .env variables first
dotenv.config();

const connectDB = require('./config/db');

// Ensure models are loaded/registered BEFORE routes that use them
require('./models/MenuItem'); // This ensures the MenuItem schema is registered with Mongoose
require('./models/AdminUser'); // This ensures the AdminUser schema is registered with Mongoose
require('./models/Customer'); // This ensures the Customer schema is registered with Mongoose
require('./models/PasswordReset'); // This ensures the PasswordReset schema is registered with Mongoose
require('./models/Ingredient'); // This ensures the Ingredient schema is registered with Mongoose

// Now require routes (which in turn require controllers that use the models)
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Add this line
const orderRoutes = require('./routes/orderRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

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

// Trust the proxy to get the real IP address. 
// This is necessary if your app is behind a reverse proxy (like Nginx, Heroku, etc.)
app.enable('trust proxy');

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
  res.send('Kahit Saan API is running...');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Store user's IP and device info for targeting
  const userInfo = {
    ip: socket.request.connection.remoteAddress,
    userAgent: socket.request.headers['user-agent'],
    socketId: socket.id
  };
  console.log('User info:', userInfo);
  
  // Join order room for real-time notifications
  socket.on('join-order-room', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`User ${socket.id} joined order room: order-${orderId}`);
  });
  
  // Leave order room
  socket.on('leave-order-room', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`User ${socket.id} left order room: order-${orderId}`);
  });
  
  // Join inventory management room (for admins)
  socket.on('join-inventory-room', () => {
    socket.join('inventory-management');
    console.log(`User ${socket.id} joined inventory management room`);
  });
  
  // Leave inventory management room
  socket.on('leave-inventory-room', () => {
    socket.leave('inventory-management');
    console.log(`User ${socket.id} left inventory management room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Set the io instance for use in other files
setIO(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export io for use in other files
module.exports = { io };
