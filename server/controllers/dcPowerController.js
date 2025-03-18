const DCPower = require("../models/DCPower");

// POST - Store or Update DC Power Data
const storeDCPowerData = async (req, res) => {
  try {
    console.log("Received DC power data:", req.body);

    // Try to extract data from the request body
    let voltage, current;

    // Case 1: If all values are provided in the expected format
    if (req.body.voltage != null && req.body.current != null) {
      voltage = req.body.voltage;
      current = req.body.current;
    }
    // Case 2: If data is sent in a different structure
    else if (req.body.dcPower != null) {
      // Assuming the ESP32 might send a nested 'dcPower' object
      voltage = req.body.dcPower.voltage || req.body.dcPower.v;
      current = req.body.dcPower.current || req.body.dcPower.i;
    }
    // Case 3: If we need to look for alternative field names
    else {
      voltage = req.body.v || req.body.volt || req.body.dcVoltage;
      current = req.body.i || req.body.curr || req.body.dcCurrent;
    }

    // Validate required fields
    if (voltage == null || current == null) {
      console.error("Missing DC power fields:", req.body);
      return res.status(400).json({
        message: "All DC power fields are required",
        received: req.body,
        expected: {
          voltage: "number",
          current: "number",
        },
      });
    }

    // Convert to numbers to ensure proper data type
    voltage = parseFloat(voltage);
    current = parseFloat(current);

    // Find the existing record (we'll keep only one document with the latest values)
    let existingRecord = await DCPower.findOne();

    if (existingRecord) {
      // Update the existing record
      existingRecord.voltage = voltage;
      existingRecord.current = current;
      existingRecord.timestamp = new Date();
      await existingRecord.save();

      return res.status(200).json({
        message: "DC power data updated successfully",
        data: existingRecord,
      });
    } else {
      // If no record exists, create a new one
      const newDCPowerRecord = new DCPower({
        voltage,
        current,
        timestamp: new Date(),
      });
      await newDCPowerRecord.save();

      return res.status(201).json({
        message: "DC power data stored successfully",
        data: newDCPowerRecord,
      });
    }
  } catch (error) {
    console.error("DC power data storage error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// GET - Retrieve Latest DC Power Data
const getLatestDCPowerData = async (req, res) => {
  try {
    const latestData = await DCPower.findOne().sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({ message: "No DC power data found" });
    }

    return res.json(latestData);
  } catch (error) {
    console.error("DC power data retrieval error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching DC power data", error: error.message });
  }
};

module.exports = { storeDCPowerData, getLatestDCPowerData };
