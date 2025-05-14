// routes/userRoutes.js
const express = require('express');
const { updateUserProfile, changePassword } = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

// Apply verifyToken middleware to protect these routes
router.put("/me/update", verifyToken, updateUserProfile);
router.put("/me/change-password", verifyToken, changePassword);

module.exports = router;