const express = require('express');
const { getUserThresholds, updateUserThresholds } = require('../controllers/thresholdController');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get user threshold settings
router.get('/', getUserThresholds);

// Update user threshold settings
router.put('/', updateUserThresholds);

module.exports = router;
