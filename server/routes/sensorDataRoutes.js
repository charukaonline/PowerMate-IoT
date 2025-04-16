const express = require("express");
const {
  storeSensorData,
  storeTempData,
} = require("../controllers/sensorDataController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST endpoints with authentication required
router.post("/data", authMiddleware, storeSensorData);
router.post("/temp-data", authMiddleware, storeTempData); // For temperature data

module.exports = router;
