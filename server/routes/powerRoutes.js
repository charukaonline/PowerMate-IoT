const express = require("express");
const {
  storePowerData,
  getLatestPowerData,
} = require("../controllers/powerController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST endpoint to store power data (DC and Battery) - requires authentication
router.post("/", auth, storePowerData);

// GET endpoint to retrieve latest power data (DC and Battery)
router.get("/", getLatestPowerData);

// DEBUG endpoint for testing
router.post("/debug", (req, res) => {
  console.log("Debug power endpoint received:", req.body);
  console.log("Headers:", req.headers);
  res.status(200).json({
    message: "Debug endpoint received data",
    data: req.body,
  });
});

module.exports = router;
