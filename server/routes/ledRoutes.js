const express = require("express");
const router = express.Router();
const LedState = require("../models/LedState");

// Endpoint to get the current LED state
router.get("/", async (req, res) => {
  try {
    const ledState = await LedState.findOne();
    if (!ledState) {
      return res.status(404).json({ message: "LED state not found" });
    }
    res.json(ledState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update the LED state
router.post("/", async (req, res) => {
  try {
    const { state } = req.body;
    if (!["ON", "OFF"].includes(state)) {
      return res.status(400).json({ message: "Invalid LED state" });
    }

    let ledState = await LedState.findOne();
    if (!ledState) {
      ledState = new LedState({ state });
    } else {
      ledState.state = state;
    }

    await ledState.save();
    res.json(ledState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
