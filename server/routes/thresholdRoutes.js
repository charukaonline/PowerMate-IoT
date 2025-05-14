const express = require('express');
const { getUserThresholds, updateUserThresholds } = require('../controllers/thresholdController');

const router = express.Router();

// Get user threshold settings
router.get('/get-thresholds', getUserThresholds);

// Update user threshold settings
router.put('/update-thresholds', updateUserThresholds);

module.exports = router;