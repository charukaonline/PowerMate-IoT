const express = require("express");
const { storeSensorData } = require("../controllers/sensorDataController");

const router = express.Router();

// POST endpoint to store all sensor data - no authentication required
router.post("/data", storeSensorData);

module.exports = router;
