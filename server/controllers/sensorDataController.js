const Battery = require("../models/Battery");
const DCPower = require("../models/DCPower");
const Distance = require("../models/Distance");
const Temperature = require("../models/Temperature");

// POST - Store all sensor data in a single request (excluding temperature)
const storeSensorData = async (req, res) => {
  try {
    console.log("Received sensor data:", req.body);
    const results = {};
    const timestamp = new Date();
    const deviceId = req.deviceId; // From auth middleware

    // Process battery data if provided
    if (req.body.battery) {
      try {
        const batteryData = processBatteryData(req.body.battery);
        // Since Battery model is designed to keep only the latest values
        let batteryRecord = await Battery.findOne();

        if (batteryRecord) {
          // Update existing record
          batteryRecord.voltage = batteryData.voltage;
          batteryRecord.current = batteryData.current;
          batteryRecord.percentage = batteryData.percentage;
          batteryRecord.timestamp = timestamp;
          await batteryRecord.save();
        } else {
          // Create new record
          batteryRecord = new Battery({
            ...batteryData,
            timestamp,
          });
          await batteryRecord.save();
        }

        results.battery = { success: true, data: batteryRecord };
      } catch (error) {
        results.battery = { success: false, error: error.message };
      }
    }

    // Process DC power data if provided
    if (req.body.dcPower) {
      try {
        const dcPowerData = processDCPowerData(req.body.dcPower);
        // Since DCPower model is designed to keep only the latest values
        let dcPowerRecord = await DCPower.findOne();

        if (dcPowerRecord) {
          // Update existing record
          dcPowerRecord.voltage = dcPowerData.voltage;
          dcPowerRecord.current = dcPowerData.current;
          dcPowerRecord.timestamp = timestamp;
          await dcPowerRecord.save();
        } else {
          // Create new record
          dcPowerRecord = new DCPower({
            ...dcPowerData,
            timestamp,
          });
          await dcPowerRecord.save();
        }

        results.dcPower = { success: true, data: dcPowerRecord };
      } catch (error) {
        results.dcPower = { success: false, error: error.message };
      }
    }

    // Process distance data if provided
    if (req.body.distance) {
      try {
        const distanceData = processDistanceData(req.body.distance);
        // Create a new Distance record (seems to allow multiple records)
        const distanceRecord = new Distance({
          ...distanceData,
          timestamp,
        });
        await distanceRecord.save();

        results.distance = { success: true, data: distanceRecord };
      } catch (error) {
        results.distance = { success: false, error: error.message };
      }
    }

    // Return consolidated results
    return res.status(200).json({
      message: "Sensor data processed",
      deviceId,
      timestamp,
      results,
    });
  } catch (error) {
    console.error("Sensor data processing error:", error);
    return res.status(500).json({
      message: "Error processing sensor data",
      error: error.message,
    });
  }
};

// POST - Store temperature data separately
const storeTempData = async (req, res) => {
  try {
    console.log("Received temperature data:", req.body);
    const timestamp = new Date();
    const deviceId = req.deviceId; // From auth middleware

    try {
      const temperatureData = processTemperatureData(req.body);
      // Temperature model is designed to have only one document
      let temperatureRecord = await Temperature.findOne();

      if (temperatureRecord) {
        // Update existing record
        temperatureRecord.temperatureC = temperatureData.temperatureC;
        temperatureRecord.temperatureF = temperatureData.temperatureF;
        temperatureRecord.humidity = temperatureData.humidity;
        temperatureRecord.timestamp = timestamp;
        await temperatureRecord.save();
      } else {
        // Create new record
        temperatureRecord = new Temperature({
          ...temperatureData,
          timestamp,
        });
        await temperatureRecord.save();
      }

      return res.status(200).json({
        message: "Temperature data processed",
        deviceId,
        timestamp,
        data: temperatureRecord,
      });
    } catch (error) {
      console.error("Temperature data processing error:", error);
      return res.status(400).json({
        message: "Error processing temperature data",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Temperature endpoint error:", error);
    return res.status(500).json({
      message: "Server error processing temperature data",
      error: error.message,
    });
  }
};

// Helper functions to process and validate each type of data
function processBatteryData(data) {
  // Extract and validate battery data
  let voltage, current, percentage;

  if (typeof data === "object") {
    voltage = data.voltage !== undefined ? data.voltage : data.v;
    current = data.current !== undefined ? data.current : data.i;
    percentage = data.percentage !== undefined ? data.percentage : data.soc;
  } else {
    throw new Error("Invalid battery data format");
  }

  if (
    voltage === undefined ||
    current === undefined ||
    percentage === undefined
  ) {
    throw new Error("Missing required battery fields");
  }

  return {
    voltage: parseFloat(voltage),
    current: parseFloat(current),
    percentage: parseFloat(percentage),
  };
}

function processDCPowerData(data) {
  // Extract and validate DC power data
  let voltage, current;

  if (typeof data === "object") {
    voltage = data.voltage !== undefined ? data.voltage : data.v;
    current = data.current !== undefined ? data.current : data.i;
  } else {
    throw new Error("Invalid DC power data format");
  }

  if (voltage === undefined || current === undefined) {
    throw new Error("Missing required DC power fields");
  }

  return {
    voltage: parseFloat(voltage),
    current: parseFloat(current),
  };
}

function processDistanceData(data) {
  // Extract and validate distance data
  let distance;

  if (typeof data === "object") {
    distance = data.distance !== undefined ? data.distance : data.d;
  } else if (typeof data === "number" || typeof data === "string") {
    distance = data;
  } else {
    throw new Error("Invalid distance data format");
  }

  if (distance === undefined) {
    throw new Error("Missing required distance field");
  }

  return {
    distance: parseFloat(distance),
  };
}

function processTemperatureData(data) {
  // Extract and validate temperature data
  let temperatureC,
    temperatureF,
    humidity = 0;

  if (typeof data === "object") {
    // Handle single temperature value (assuming Celsius by default)
    if (data.temperature !== undefined) {
      temperatureC = data.temperature;
      // Convert to Fahrenheit: F = (C * 9/5) + 32
      temperatureF = (parseFloat(temperatureC) * 9) / 5 + 32;
    } else {
      temperatureC =
        data.temperatureC !== undefined ? data.temperatureC : data.celsius;
      temperatureF =
        data.temperatureF !== undefined ? data.temperatureF : data.fahrenheit;
    }

    humidity =
      data.humidity !== undefined
        ? data.humidity
        : data.humid !== undefined
        ? data.humid
        : 0;
  } else {
    throw new Error("Invalid temperature data format");
  }

  if (temperatureC === undefined || temperatureF === undefined) {
    throw new Error("Missing required temperature fields");
  }

  return {
    temperatureC: parseFloat(temperatureC),
    temperatureF: parseFloat(temperatureF),
    humidity: parseFloat(humidity),
  };
}

module.exports = { storeSensorData, storeTempData };
