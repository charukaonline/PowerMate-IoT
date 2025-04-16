const mongoose = require("mongoose");

const batterySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// This ensures we only keep one document for each device
batterySchema.index({ deviceId: 1 }, { unique: true });
batterySchema.index({ timestamp: -1 });

const Battery = mongoose.model("Battery", batterySchema);

module.exports = Battery;
