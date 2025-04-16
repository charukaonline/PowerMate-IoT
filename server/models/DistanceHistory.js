const mongoose = require("mongoose");

const distanceHistorySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  distance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create indexes for faster queries
distanceHistorySchema.index({ deviceId: 1, timestamp: -1 });

const DistanceHistory = mongoose.model(
  "DistanceHistory",
  distanceHistorySchema
);

module.exports = DistanceHistory;
