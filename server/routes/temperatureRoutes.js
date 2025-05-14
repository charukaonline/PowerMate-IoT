// routes/temperatureRoutes.js
const express = require('express');
const { getTemperatureData } = require('../controllers/temperatureController');

const router = express.Router();

// Define route to fetch temperature data
router.get('/temperature', getTemperatureData);

module.exports = router;