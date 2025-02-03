const express = require("express");
const {
  storeTemperature,
  getLatestTemperature,
} = require("../controllers/temperatureController");

const router = express.Router();

// Store temperature & humidity data
router.post("/", storeTemperature);

// Get latest temperature & humidity data
router.get("/", getLatestTemperature);

module.exports = router;
