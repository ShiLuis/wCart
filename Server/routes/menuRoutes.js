const expressMenu = require('express');
const routerMenu = expressMenu.Router();
const { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protectAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

// Public routes
routerMenu.get('/', getMenuItems);
routerMenu.get('/:id', getMenuItemById);

// Admin protected routes
routerMenu.post('/', protectAdmin, upload.single('photo'), createMenuItem); // 'photo' is the field name for the file
routerMenu.put('/:id', protectAdmin, upload.single('photo'), updateMenuItem);
routerMenu.delete('/:id', protectAdmin, deleteMenuItem);

module.exports = routerMenu; 