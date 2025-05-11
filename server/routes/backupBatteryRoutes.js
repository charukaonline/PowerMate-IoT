const express = require('express');
const router = express.Router();
const backupBatteryController = require('../controllers/backupBatteryController');

// Get current battery data
// GET /api/backup-battery/current?deviceId=88:13:BF:0C:3B:6C (optional deviceId query parameter)
router.get('/current', backupBatteryController.getCurrentData);

// Get historical battery data
// GET /api/backup-battery/history?deviceId=88:13:BF:0C:3B:6C&startDate=2023-05-01&endDate=2023-05-15&page=1&limit=10
router.get('/history', backupBatteryController.getHistoricalData);

// Save new battery data
// POST /api/backup-battery
router.post('/', backupBatteryController.saveData);

// Get chart data (with date filtering)
// GET /api/backup-battery/chart?deviceId=88:13:BF:0C:3B:6C
router.get('/chart', backupBatteryController.getChartData);

module.exports = router;
