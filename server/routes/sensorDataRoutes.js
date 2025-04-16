const express = require("express");
const {
  storeSensorData,
  storeTempData,
  getBatteryHistory,
  getDCPowerHistory,
  getDistanceHistory,
  getTemperatureData,
} = require("../controllers/sensorDataController");
const { authenticateDevice } = require("../middleware/auth");

const router = express.Router();

// Check if handlers are properly imported
console.log("Handlers loaded:", {
  storeSensorData: typeof storeSensorData,
  storeTempData: typeof storeTempData,
  authenticateDevice: typeof authenticateDevice,
});

// Data posting endpoints - require device authentication
router.post("/data", authenticateDevice, storeSensorData);
router.post("/temperature", authenticateDevice, storeTempData);
router.post("/temp-data", authenticateDevice, storeTempData);

// Historical data endpoints - you might want to add user authentication here
router.get("/history/battery/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { start, end, limit } = req.query;

    const data = await getBatteryHistory(
      deviceId,
      start,
      end,
      limit ? parseInt(limit) : 1000
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/history/dcpower/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { start, end, limit } = req.query;

    const data = await getDCPowerHistory(
      deviceId,
      start,
      end,
      limit ? parseInt(limit) : 1000
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/history/distance/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { start, end, limit } = req.query;

    const data = await getDistanceHistory(
      deviceId,
      start,
      end,
      limit ? parseInt(limit) : 1000
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current temperature data (no history)
router.get("/temperature/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { espDeviceId } = req.query;

    const data = await getTemperatureData(deviceId, espDeviceId || null);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "No temperature data found for this device",
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
