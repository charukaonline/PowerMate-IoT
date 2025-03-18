const mongoose = require("mongoose");

const batterySchema = new mongoose.Schema({
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// This ensures we only keep one document for the latest values
batterySchema.index({ timestamp: -1 });

const Battery = mongoose.model("Battery", batterySchema);

module.exports = Battery;
