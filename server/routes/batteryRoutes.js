const express = require("express");
const {
  storeBatteryData,
  getLatestBatteryData,
} = require("../controllers/batteryController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST endpoint to store battery data - requires authentication
router.post("/", auth, storeBatteryData);

// GET endpoint to retrieve latest battery data
router.get("/", getLatestBatteryData);

// DEBUG endpoint to see raw battery data
router.post("/debug", (req, res) => {
  console.log("Debug battery endpoint received:", req.body);
  console.log("Headers:", req.headers);
  res.status(200).json({
    message: "Debug endpoint received data",
    data: req.body,
  });
});

module.exports = router;
