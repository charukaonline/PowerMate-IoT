const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const sensorDataRoutes = require("./routes/sensorDataRoutes");

dotenv.config();
connectDB();

const app = express();
// Allow requests from all origins for IoT device connectivity
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true,
  })
);
app.use(express.json());

// Add detailed request logging middleware BEFORE routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Headers:", req.headers);
  if (req.body && Object.keys(req.body).length) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Root route to provide basic API information
app.get("/", (req, res) => {
  res.status(200).json({
    name: "PowerMate Sensor API",
    description: "API for receiving and storing sensor data from IoT devices",
    version: "1.0.0",
    endpoints: {
      ping: "/api/ping - Test API connectivity",
      sensorData: "/api/sensor-data/data - Submit sensor readings (POST)",
    },
    documentation: "Contact administrator for API documentation",
  });
});

// Basic connectivity test endpoint - uncommented for testing
app.get("/api/ping", (req, res) => {
  console.log("Ping received from:", req.ip);
  res.status(200).json({
    status: "online",
    message: "Server is reachable",
    timestamp: new Date().toISOString(),
  });
});

// Sensor data routes
app.use("/api/sensor-data", sensorDataRoutes);

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /api/ping",
      "POST /api/sensor-data/data",
    ],
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Server available at http://localhost:${PORT} and on your local network`
  );
  // Display the server's IP addresses for easier connection
  const networkInterfaces = require("os").networkInterfaces();
  console.log("Available on network addresses:");
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        console.log(`http://${address.address}:${PORT}`);
      }
    }
  }
});
