const expressMenu = require('express');
const routerMenu = expressMenu.Router();
const { 
  getMenuItems, 
  getMenuItemById, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getMenuItemsByCategory,
  getCategories,
  toggleItemAvailability,
  getMenuStats
} = require('../controllers/menuController');
const { protectAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

// Public routes
routerMenu.get('/', getMenuItems);
routerMenu.get('/categories', getCategories);
routerMenu.get('/category/:category', getMenuItemsByCategory);
routerMenu.get('/:id', getMenuItemById);

// Admin protected routes
routerMenu.get('/admin/stats', protectAdmin, getMenuStats);
routerMenu.post('/', protectAdmin, upload.single('photo'), createMenuItem); // 'photo' is the field name for the file
routerMenu.put('/:id', protectAdmin, upload.single('photo'), updateMenuItem);
routerMenu.put('/:id/toggle-availability', protectAdmin, toggleItemAvailability);
routerMenu.delete('/:id', protectAdmin, deleteMenuItem);

module.exports = routerMenu; 