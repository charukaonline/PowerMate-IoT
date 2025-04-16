const mongoose = require("mongoose");

const distanceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  distance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Distance keeps history, so we don't need a unique index on deviceId
distanceSchema.index({ deviceId: 1, timestamp: -1 });

const Distance = mongoose.model("Distance", distanceSchema);

module.exports = Distance;
