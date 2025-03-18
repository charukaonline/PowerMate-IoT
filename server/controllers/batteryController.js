const Battery = require("../models/Battery");

// POST - Store or Update Battery Data
const storeBatteryData = async (req, res) => {
  try {
    console.log("Received battery data:", req.body);

    // Try to extract data from the request body
    let voltage, current, percentage;

    // Case 1: If all values are provided in the expected format
    if (
      req.body.voltage != null &&
      req.body.current != null &&
      (req.body.percentage != null || req.body.batteryPercentage != null)
    ) {
      voltage = req.body.voltage;
      current = req.body.current;
      percentage = req.body.percentage || req.body.batteryPercentage; // Accept either key
    }
    // Case 2: If data is sent in a different structure
    else if (req.body.battery != null) {
      // Assuming the ESP32 might send a nested 'battery' object
      voltage = req.body.battery.voltage || req.body.battery.v;
      current = req.body.battery.current || req.body.battery.i;
      percentage =
        req.body.battery.percentage ||
        req.body.battery.batteryPercentage ||
        req.body.battery.soc;
    }
    // Case 3: If we need to look for alternative field names
    else {
      voltage = req.body.v || req.body.volt || req.body.voltage;
      current = req.body.i || req.body.curr || req.body.current;
      percentage =
        req.body.soc ||
        req.body.pct ||
        req.body.percentage ||
        req.body.batteryPercentage;
    }

    // Validate required fields
    if (voltage == null || current == null || percentage == null) {
      console.error("Missing battery fields:", req.body);
      return res.status(400).json({
        message: "All battery fields are required",
        received: req.body,
        expected: {
          voltage: "number",
          current: "number",
          percentage: "number (can also be sent as 'batteryPercentage')",
        },
      });
    }

    // Convert to numbers to ensure proper data type
    voltage = parseFloat(voltage);
    current = parseFloat(current);
    percentage = parseFloat(percentage);

    // Find the existing record (we'll keep only one document with the latest values)
    let existingRecord = await Battery.findOne();

    if (existingRecord) {
      // Update the existing record
      existingRecord.voltage = voltage;
      existingRecord.current = current;
      existingRecord.percentage = percentage;
      existingRecord.timestamp = new Date();
      await existingRecord.save();

      return res.status(200).json({
        message: "Battery data updated successfully",
        data: existingRecord,
      });
    } else {
      // If no record exists, create a new one
      const newBatteryRecord = new Battery({
        voltage,
        current,
        percentage,
        timestamp: new Date(),
      });
      await newBatteryRecord.save();

      return res.status(201).json({
        message: "Battery data stored successfully",
        data: newBatteryRecord,
      });
    }
  } catch (error) {
    console.error("Battery data storage error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// GET - Retrieve Latest Battery Data
const getLatestBatteryData = async (req, res) => {
  try {
    const latestData = await Battery.findOne().sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({ message: "No battery data found" });
    }

    return res.json(latestData);
  } catch (error) {
    console.error("Battery data retrieval error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching battery data", error: error.message });
  }
};

module.exports = { storeBatteryData, getLatestBatteryData };
