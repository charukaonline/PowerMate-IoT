const express = require("express");
const { storeSensorData, storeTempData } = require("../controllers/sensorDataController");

const router = express.Router();

// POST endpoint to store all sensor data - no authentication required
router.post("/data", storeSensorData);
router.post("/temp-data", storeTempData); // For temperature data

module.exports = router;
