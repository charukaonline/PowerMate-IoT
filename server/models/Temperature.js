const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperatureC: { type: Number, required: true },
  temperatureF: { type: Number, required: true },
  humidity: { type: Number, required: false, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

// Create a compound index for device identification
// This allows us to have unique records per deviceId+espDeviceId combination
temperatureSchema.index({ deviceId: 1, espDeviceId: 1 }, { unique: true });

const Temperature = mongoose.model("Temperature", temperatureSchema);

module.exports = Temperature;
