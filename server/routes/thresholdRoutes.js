const express = require('express');
const { getUserThresholds, updateUserThresholds } = require('../controllers/thresholdController');

const router = express.Router();

// Get user threshold settings
router.get('/', getUserThresholds);

// Update user threshold settings
router.put('/', updateUserThresholds);

module.exports = router;