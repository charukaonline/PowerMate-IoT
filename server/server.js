const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const distanceRoutes = require("./routes/distanceRoutes");
const temperatureRoutes = require("./routes/temperatureRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/distance", distanceRoutes);
app.use("/api/temperature", temperatureRoutes); // Register temperature API

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
