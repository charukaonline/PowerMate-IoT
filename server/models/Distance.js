const mongoose = require("mongoose");

const DistanceSchema = new mongoose.Schema({
  distance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Distance = mongoose.model("Distance", DistanceSchema);

module.exports = Distance;