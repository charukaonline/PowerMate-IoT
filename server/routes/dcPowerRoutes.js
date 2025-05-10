const express = require('express');
const router = express.Router();
const dcPowerController = require('../controllers/dcPowerController');

// Get current power data
router.get('/current', dcPowerController.getCurrentData);

// Get historical power data
router.get('/history', dcPowerController.getHistoricalData);

// Save new power data
router.post('/', dcPowerController.saveData);

// Get chart data (24-hour aggregation)
router.get('/chart', dcPowerController.getChartData);

module.exports = router;
