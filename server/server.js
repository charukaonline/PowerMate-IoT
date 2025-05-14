const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Add this import
const connectDB = require("./config/db");
const sensorDataRoutes = require("./routes/sensorDataRoutes");
const authRoutes = require("./routes/authRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");
const dcpowerHistoryRoutes = require("./routes/dcHistoryRoutes");
const batteryHistoryRoutes = require("./routes/batteryHistoryRoutes");
const currentFuelLevelRoutes = require("./routes/currentFuelLevelRoutes");
const temperatureRoutes = require("./routes/temperatureRoutes");
const thresholdRoutes = require("./routes/thresholdRoutes");
const dcCurrentRoutes = require("./routes/dcPowerRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const userController = require("./routes/userControllerRoutes");
const helmet = require('helmet');



// Load environment variables
dotenv.config();






// Check for MongoDB URI
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGODB_URI environment variable is not defined!");
  console.error(
    "Please create or update your .env file with a valid MongoDB URI"
  );
  console.error("Example: MONGODB_URI=mongodb://localhost:27017/powermate");
  console.error("Continuing with database connection disabled...");
} else {
  // Only connect to the database if we have a URI
  connectDB();
}

const app = express();

// Configure CORS with specific origins instead of wildcard
// This fixes the issue with credentials and preflight requests
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

app.use('/static', express.static('public'));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],        // only allow external JS from same origin
    styleSrc:   ["'self'"],        // only allow external CSS from same origin
    imgSrc:     ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc:    ["'self'"],
    objectSrc:  ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // allow non-origin requests
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        // Deny requests from unknown origins for security
        return callback(new Error('Origin not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Add cookie parser middleware
app.use(cookieParser());

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
      auth: "/api/auth/device - Authenticate devices (POST)",
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
app.use("/api/auth", authRoutes);
app.use("/api/sensor-data", sensorDataRoutes);
app.use("/api/userAuth", userAuthRoutes);
app.use("/api/thresholds", require("./routes/thresholdRoutes"));
app.use('/api/generator', require('./routes/generatorRoutes'));
app.use('/api/', dcpowerHistoryRoutes);
app.use('/api/', batteryHistoryRoutes);
app.use('/api/', currentFuelLevelRoutes);
app.use('/api/', temperatureRoutes);


app.use('/api/', logoutRoutes);
app.use('/api/', dcCurrentRoutes);
app.use('/api/', userController);
app.use('/api/thresholds', thresholdRoutes);

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /api/ping",
      "POST /api/auth/device",
      "POST /api/sensor-data/data",
      "POST /api/sensor-data/temp-data",
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