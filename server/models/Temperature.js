const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema({
  temperatureC: { type: Number, required: true },
  temperatureF: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Ensure only one document exists
const Temperature = mongoose.model("Temperature", temperatureSchema);

module.exports = Temperature;
