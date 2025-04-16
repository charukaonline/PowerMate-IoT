const jwt = require("jsonwebtoken");

// Create a named function for better readability
const authenticateDevice = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    try {
      // Make sure we're using the same secret as in the auth controller
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "powermate-iot-secret-key"
      );
      req.deviceId = decoded.deviceId;
      console.log("Authenticated request from device:", req.deviceId);
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { authenticateDevice };
