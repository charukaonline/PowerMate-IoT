const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
require("dotenv").config();

mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
    }
);
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
const ledRoutes = require("./routes/ledRoutes");
app.use("/api/led", ledRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
