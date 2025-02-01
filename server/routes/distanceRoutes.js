const express = require("express");
const {
  storeDistance,
  getLatestDistance,
  storeAllDistance,
} = require("../controllers/distanceController");

const router = express.Router();

router.post("/", storeDistance); // Store Distance
router.get("/", getLatestDistance); // Fetch Latest Distance
router.post("/", storeAllDistance);

module.exports = router;
