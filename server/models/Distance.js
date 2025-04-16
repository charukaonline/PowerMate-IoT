const mongoose = require("mongoose");

const distanceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  distance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// This ensures we only keep one document for each device
distanceSchema.index({ deviceId: 1 }, { unique: true });
distanceSchema.index({ timestamp: -1 });

const Distance = mongoose.model("Distance", distanceSchema);

module.exports = Distance;
