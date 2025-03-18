const mongoose = require("mongoose");

const dcPowerSchema = new mongoose.Schema({
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// This ensures we only keep one document for the latest values
dcPowerSchema.index({ timestamp: -1 });

const DCPower = mongoose.model("DCPower", dcPowerSchema);

module.exports = DCPower;
