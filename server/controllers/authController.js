const jwt = require("jsonwebtoken");

// Create a map of allowed device IDs with their secrets
// In production, you would store this in a database
const ALLOWED_DEVICES = {
  "tower1": "cnk12345",
  "PowerMate-ESP32-001": "deviceSecret1", // Added your ESP32's device ID and secret
  // Add more devices as needed
};

const authenticateDevice = async (req, res) => {
  try {
    const { deviceId, deviceSecret } = req.body;

    console.log("Authentication attempt from device:", deviceId);

    // Validate device credentials
    if (!deviceId || !deviceSecret) {
      return res
        .status(400)
        .json({ message: "Device ID and secret are required" });
    }

    // Check if device is allowed and secret matches
    if (
      !ALLOWED_DEVICES[deviceId] ||
      ALLOWED_DEVICES[deviceId] !== deviceSecret
    ) {
      return res.status(401).json({ message: "Invalid device credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { deviceId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { authenticateDevice };
