const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const distanceRoutes = require("./routes/distanceRoutes");
const temperatureRoutes = require("./routes/temperatureRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/auth");
const batteryRoutes = require("./routes/batteryRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes don't need auth middleware
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/distance", authMiddleware, distanceRoutes);
app.use("/api/temperature", authMiddleware, temperatureRoutes);
app.use("/api/battery", batteryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
