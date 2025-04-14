const express = require("express");
const { storeSensorData } = require("../controllers/sensorDataController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST endpoint to store all sensor data - requires authentication
router.post("/", auth, storeSensorData);

module.exports = router;
