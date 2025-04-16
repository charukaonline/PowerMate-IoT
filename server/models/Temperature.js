const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperatureC: { type: Number, required: true },
  temperatureF: { type: Number, required: true },
  humidity: { type: Number, required: false, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

// Ensure only one document exists per device
temperatureSchema.index({ deviceId: 1 }, { unique: true });

const Temperature = mongoose.model("Temperature", temperatureSchema);

module.exports = Temperature;
