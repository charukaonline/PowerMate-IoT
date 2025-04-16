const jwt = require("jsonwebtoken");

// Create a map of allowed device IDs with their secrets or types
// In production, you would store this in a database
const ALLOWED_DEVICES = {
  tower1: "cnk12345",
  "PowerMate-ESP32-001": "deviceSecret1",
  // Add your ESP32 MAC address here - this is what's causing the 401 error
  // The ESP32 is sending its MAC address as the deviceId
  // Example - replace with your actual MAC address from the Serial Monitor output:
  "08:A6:F7:B1:C9:A0": "esp32-02",

  "88:13:BF:0C:3B:6C": "esp32-01",
};

const authenticateDevice = async (req, res) => {
  try {
    const { deviceId, deviceType } = req.body;

    console.log(
      "Authentication attempt from device:",
      deviceId,
      "type:",
      deviceType
    );

    // Validate device credentials
    if (!deviceId) {
      return res.status(400).json({ message: "Device ID is required" });
    }

    // For ESP32 devices using MAC address as ID:
    // 1. Check if device is in the allowed list directly
    // 2. If using the wildcard entry for testing
    if (
      ALLOWED_DEVICES[deviceId] ||
      ALLOWED_DEVICES["*"] === deviceType // Wildcard for testing
    ) {
      // Generate JWT token
      const token = jwt.sign(
        { deviceId },
        process.env.JWT_SECRET || "powermate-iot-secret-key",
        { expiresIn: "7d" } // Token valid for 7 days
      );

      // Return the token
      return res.status(200).json({ token });
    }

    // If we reached here, authentication failed
    return res.status(401).json({ message: "Invalid device credentials" });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { authenticateDevice };
