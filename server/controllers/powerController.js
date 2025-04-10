const Battery = require("../models/Battery");
const DCPower = require("../models/DCPower");

// POST - Store or Update Power Data (both Battery and DC Power)
const storePowerData = async (req, res) => {
  try {
    console.log("Received power data:", req.body);

    // Extract DC power data
    let dcVoltage, dcCurrent;
    // Extract battery data
    let batteryVoltage, batteryCurrent, batteryPercentage;

    // Handle different input formats
    if (req.body.dc && req.body.battery) {
      // Format: { dc: { voltage, current }, battery: { voltage, current, percentage } }
      dcVoltage = req.body.dc.voltage || req.body.dc.v;
      dcCurrent = req.body.dc.current || req.body.dc.i;

      batteryVoltage = req.body.battery.voltage || req.body.battery.v;
      batteryCurrent = req.body.battery.current || req.body.battery.i;
      batteryPercentage =
        req.body.battery.percentage ||
        req.body.battery.soc ||
        req.body.battery.batteryPercentage;
    } else {
      // Format with flat keys
      dcVoltage = req.body.dcVoltage || req.body.dc_voltage || req.body.dcV;
      dcCurrent = req.body.dcCurrent || req.body.dc_current || req.body.dcI;

      batteryVoltage =
        req.body.batteryVoltage || req.body.battery_voltage || req.body.battV;
      batteryCurrent =
        req.body.batteryCurrent || req.body.battery_current || req.body.battI;
      batteryPercentage =
        req.body.batteryPercentage ||
        req.body.battery_percentage ||
        req.body.soc;
    }

    // Validate required fields
    const missingFields = [];
    if (dcVoltage == null) missingFields.push("dcVoltage");
    if (dcCurrent == null) missingFields.push("dcCurrent");
    if (batteryVoltage == null) missingFields.push("batteryVoltage");
    if (batteryCurrent == null) missingFields.push("batteryCurrent");
    if (batteryPercentage == null) missingFields.push("batteryPercentage");

    if (missingFields.length > 0) {
      console.error("Missing power fields:", req.body);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        received: req.body,
      });
    }

    // Convert to numbers
    dcVoltage = parseFloat(dcVoltage);
    dcCurrent = parseFloat(dcCurrent);
    batteryVoltage = parseFloat(batteryVoltage);
    batteryCurrent = parseFloat(batteryCurrent);
    batteryPercentage = parseFloat(batteryPercentage);

    // Update or create DC power record
    let dcPowerResult;
    const existingDCRecord = await DCPower.findOne();

    if (existingDCRecord) {
      existingDCRecord.voltage = dcVoltage;
      existingDCRecord.current = dcCurrent;
      existingDCRecord.timestamp = new Date();
      await existingDCRecord.save();
      dcPowerResult = existingDCRecord;
    } else {
      const newDCPowerRecord = new DCPower({
        voltage: dcVoltage,
        current: dcCurrent,
        timestamp: new Date(),
      });
      await newDCPowerRecord.save();
      dcPowerResult = newDCPowerRecord;
    }

    // Update or create battery record
    let batteryResult;
    const existingBatteryRecord = await Battery.findOne();

    if (existingBatteryRecord) {
      existingBatteryRecord.voltage = batteryVoltage;
      existingBatteryRecord.current = batteryCurrent;
      existingBatteryRecord.percentage = batteryPercentage;
      existingBatteryRecord.timestamp = new Date();
      await existingBatteryRecord.save();
      batteryResult = existingBatteryRecord;
    } else {
      const newBatteryRecord = new Battery({
        voltage: batteryVoltage,
        current: batteryCurrent,
        percentage: batteryPercentage,
        timestamp: new Date(),
      });
      await newBatteryRecord.save();
      batteryResult = newBatteryRecord;
    }

    return res.status(200).json({
      message: "Power data stored successfully",
      dcPower: dcPowerResult,
      battery: batteryResult,
    });
  } catch (error) {
    console.error("Power data storage error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// GET - Retrieve Latest Power Data (Battery and DC)
const getLatestPowerData = async (req, res) => {
  try {
    const latestDCData = await DCPower.findOne().sort({ timestamp: -1 });
    const latestBatteryData = await Battery.findOne().sort({ timestamp: -1 });

    return res.json({
      dcPower: latestDCData || { message: "No DC power data found" },
      battery: latestBatteryData || { message: "No battery data found" },
    });
  } catch (error) {
    console.error("Power data retrieval error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching power data", error: error.message });
  }
};

module.exports = { storePowerData, getLatestPowerData };
