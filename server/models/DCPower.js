const mongoose = require("mongoose");

const dcPowerSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// This ensures we only keep one document for each device
dcPowerSchema.index({ deviceId: 1 }, { unique: true });
dcPowerSchema.index({ timestamp: -1 });

const DCPower = mongoose.model("DCPower", dcPowerSchema);

module.exports = DCPower;
