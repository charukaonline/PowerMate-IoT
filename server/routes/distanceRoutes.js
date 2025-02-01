const express = require("express");
const {
  storeDistance,
  getLatestDistance,
} = require("../controllers/distanceController");

const router = express.Router();

router.post("/", storeDistance); // Store Distance
router.get("/", getLatestDistance); // Fetch Latest Distance

module.exports = router;
