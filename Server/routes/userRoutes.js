const express = require('express');
const router = express.Router();
const {
    getUsers,
    registerUser,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protectAdmin } = require('../middleware/authMiddleware');

// All routes in this file are protected and require admin access
router.use(protectAdmin);

router.route('/')
    .get(getUsers)
    .post(registerUser);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;