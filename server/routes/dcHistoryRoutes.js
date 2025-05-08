const express = require('express');
const router = express.Router();
const { getAllPowerHistory } = require('../controllers/powerHistoryController');

// @route   GET /api/power-history
// @desc    Get all power history records (with pagination and optional date filters)
// @access  Public or Protected (depending on your setup)
router.get('/power-history', getAllPowerHistory);

module.exports = router;
