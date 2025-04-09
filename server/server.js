const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const distanceRoutes = require("./routes/distanceRoutes");
const temperatureRoutes = require("./routes/temperatureRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/auth");
const batteryRoutes = require("./routes/batteryRoutes");
const dcPowerRoutes = require("./routes/dcPowerRoutes");

const userAuthRoutes = require("./routes/userAuthRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());

// Auth routes don't need auth middleware
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/distance", authMiddleware, distanceRoutes);
app.use("/api/temperature", authMiddleware, temperatureRoutes);
app.use("/api/battery", batteryRoutes);
app.use("/api/dcpower", dcPowerRoutes);

app.use("/api/userAuth", userAuthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} Hello world`));
