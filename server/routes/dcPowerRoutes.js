const express = require("express");
const {
  storeDCPowerData,
  getLatestDCPowerData,
} = require("../controllers/dcPowerController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST endpoint to store DC power data - requires authentication
router.post("/", auth, storeDCPowerData);

// GET endpoint to retrieve latest DC power data
router.get("/", getLatestDCPowerData);

// DEBUG endpoint to see raw DC power data
router.post("/debug", (req, res) => {
  console.log("Debug DC power endpoint received:", req.body);
  console.log("Headers:", req.headers);
  res.status(200).json({
    message: "Debug endpoint received data",
    data: req.body,
  });
});

module.exports = router;
