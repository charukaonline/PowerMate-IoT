const mongoose = require("mongoose");

const LedStateSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ["ON", "OFF"],
    default: "OFF",
  },
});

module.exports = mongoose.model("LedState", LedStateSchema);
