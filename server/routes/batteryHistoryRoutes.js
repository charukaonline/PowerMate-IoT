const express = require('express');
const { fetchBatteryHistory } = require('../controllers/batteryHistoryController');

const router = express.Router();

// Route to get battery history data by deviceId
router.get('/battery-history/:deviceId', fetchBatteryHistory);

module.exports = router;