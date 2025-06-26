const expressAuth = require('express');
const routerAuth = expressAuth.Router();
const { registerAdmin, loginAdmin } = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware'); // If register is protected

// POST /api/auth/register (Consider protecting this or seeding admin user)
routerAuth.post('/register', registerAdmin);
routerAuth.post('/login', loginAdmin);
module.exports = routerAuth;