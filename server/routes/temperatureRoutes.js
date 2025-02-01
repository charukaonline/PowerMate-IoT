const express = require("express");
const {
  storeTemperature,
  getLatestTemperature,
} = require("../controllers/temperatureController");

const router = express.Router();

// Store temperature & humidity data
router.post("/", storeTemperature); // ✅ This should match `/api/temperature`

// Get latest temperature & humidity data
router.get("/", getLatestTemperature);

module.exports = router;
