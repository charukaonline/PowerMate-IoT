const mongoose = require("mongoose");

const dcPowerHistorySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create indexes for faster queries
dcPowerHistorySchema.index({ deviceId: 1, timestamp: -1 });

const DCPowerHistory = mongoose.model("DCPowerHistory", dcPowerHistorySchema);

module.exports = DCPowerHistory;
