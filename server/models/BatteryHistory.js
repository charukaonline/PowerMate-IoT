const mongoose = require("mongoose");

const batteryHistorySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create indexes for faster queries
batteryHistorySchema.index({ deviceId: 1, timestamp: -1 });

const BatteryHistory = mongoose.model("BatteryHistory", batteryHistorySchema);

module.exports = BatteryHistory;
