const Battery = require("../models/Battery");
const DCPower = require("../models/DCPower");
const Distance = require("../models/Distance");
const Temperature = require("../models/Temperature");

// Import history models
const BatteryHistory = require("../models/BatteryHistory");
const DCPowerHistory = require("../models/DCPowerHistory");
const DistanceHistory = require("../models/DistanceHistory");

// Database connection status tracking
let dbConnected = !!process.env.MONGO_URI;

// POST - Store all sensor data in a single request (excluding temperature)
const storeSensorData = async (req, res) => {
  try {
    console.log("Received sensor data:", req.body);
    const results = {};
    const timestamp = new Date();

    // Get deviceId from payload if available, otherwise use the one from auth middleware
    const deviceId = req.body.deviceId || req.deviceId || "unknown";
    console.log(`Processing data for device: ${deviceId}`);

    // Check if we're in DB-less mode
    if (!dbConnected && !process.env.MONGO_URI) {
      return res.status(200).json({
        message: "Sensor data received (DB storage disabled)",
        deviceId,
        timestamp,
        data: req.body,
      });
    }

    // Process battery data if provided
    if (req.body.battery) {
      try {
        const batteryData = processBatteryData(req.body.battery);

        // Store in history collection
        const batteryHistoryRecord = new BatteryHistory({
          ...batteryData,
          deviceId,
          timestamp,
        });
        await batteryHistoryRecord.save();

        // Update current state collection
        let batteryRecord = await Battery.findOne({ deviceId });
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
            deviceId,
            timestamp,
          });
          await batteryRecord.save();
        }

        results.battery = {
          success: true,
          data: batteryRecord,
          history: batteryHistoryRecord,
        };
      } catch (error) {
        results.battery = { success: false, error: error.message };
      }
    }

    // Process DC power data if provided
    if (req.body.dcPower) {
      try {
        const dcPowerData = processDCPowerData(req.body.dcPower);

        // Store in history collection
        const dcPowerHistoryRecord = new DCPowerHistory({
          ...dcPowerData,
          deviceId,
          timestamp,
        });
        await dcPowerHistoryRecord.save();

        // Update current state collection
        let dcPowerRecord = await DCPower.findOne({ deviceId });
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
            deviceId,
            timestamp,
          });
          await dcPowerRecord.save();
        }

        results.dcPower = {
          success: true,
          data: dcPowerRecord,
          history: dcPowerHistoryRecord,
        };
      } catch (error) {
        results.dcPower = { success: false, error: error.message };
      }
    }

    // Process distance data if provided
    if (req.body.distance) {
      try {
        const distanceData = processDistanceData(req.body.distance);

        // Store in history collection
        const distanceHistoryRecord = new DistanceHistory({
          ...distanceData,
          deviceId,
          timestamp,
        });
        await distanceHistoryRecord.save();

        // Update current state collection
        let distanceRecord = await Distance.findOne({ deviceId });
        if (distanceRecord) {
          // Update existing record
          distanceRecord.distance = distanceData.distance;
          distanceRecord.timestamp = timestamp;
          await distanceRecord.save();
        } else {
          // Create new record
          distanceRecord = new Distance({
            ...distanceData,
            deviceId,
            timestamp,
          });
          await distanceRecord.save();
        }

        results.distance = {
          success: true,
          data: distanceRecord,
          history: distanceHistoryRecord,
        };
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

    // Get deviceId from payload - for ESP32 temperature sensors, we may have a different format
    // Check for esp32ID, espDeviceId, or fall back to regular deviceId
    const espDeviceId = req.body.esp32ID || req.body.espDeviceId || null;
    const deviceId = req.body.deviceId || req.deviceId || "unknown";

    console.log(
      `Processing temperature data for device: ${deviceId}, ESP: ${
        espDeviceId || "none"
      }`
    );

    // Check if we're in DB-less mode
    if (!dbConnected && !process.env.MONGO_URI) {
      return res.status(200).json({
        message: "Temperature data received (DB storage disabled)",
        deviceId,
        espDeviceId,
        timestamp,
        data: req.body,
      });
    }

    try {
      const temperatureData = processTemperatureData(req.body);

      // Update current state collection
      // For temperature sensors, we need to check both deviceId and espDeviceId
      let query = { deviceId };
      if (espDeviceId) {
        query.espDeviceId = espDeviceId;
      }

      let temperatureRecord = await Temperature.findOne(query);
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
          deviceId,
          espDeviceId,
          timestamp,
        });
        await temperatureRecord.save();
      }

      return res.status(200).json({
        message: "Temperature data processed",
        deviceId,
        espDeviceId,
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
    // Handle multiple possible field names
    voltage =
      data.voltage !== undefined
        ? data.voltage
        : data.v !== undefined
        ? data.v
        : data.batteryVoltage;

    current =
      data.current !== undefined
        ? data.current
        : data.i !== undefined
        ? data.i
        : data.batteryCurrent;

    percentage =
      data.percentage !== undefined
        ? data.percentage
        : data.soc !== undefined
        ? data.soc
        : data.batteryLevel !== undefined
        ? data.batteryLevel
        : data.level;
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
    voltage =
      data.voltage !== undefined
        ? data.voltage
        : data.v !== undefined
        ? data.v
        : data.dcVoltage;

    current =
      data.current !== undefined
        ? data.current
        : data.i !== undefined
        ? data.i
        : data.dcCurrent;
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
    distance =
      data.distance !== undefined
        ? data.distance
        : data.d !== undefined
        ? data.d
        : data.fuelLevel !== undefined
        ? data.fuelLevel
        : data.level;
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
    // Handle ESP32-specific temperature formats
    // ESP32 often uses "temp" or "t" as shorthand
    temperatureC =
      data.temperature !== undefined
        ? data.temperature
        : data.temperatureC !== undefined
        ? data.temperatureC
        : data.celsius !== undefined
        ? data.celsius
        : data.temp_c !== undefined
        ? data.temp_c
        : data.temp !== undefined
        ? data.temp
        : data.t !== undefined
        ? data.t
        : data.tempC;

    temperatureF =
      data.temperatureF !== undefined
        ? data.temperatureF
        : data.fahrenheit !== undefined
        ? data.fahrenheit
        : data.temp_f !== undefined
        ? data.temp_f
        : data.tempF;

    // If we have Celsius but not Fahrenheit, calculate it
    if (temperatureC !== undefined && temperatureF === undefined) {
      temperatureF = (parseFloat(temperatureC) * 9) / 5 + 32;
    }
    // If we have Fahrenheit but not Celsius, calculate it
    else if (temperatureF !== undefined && temperatureC === undefined) {
      temperatureC = ((parseFloat(temperatureF) - 32) * 5) / 9;
    }

    // ESP32 typically uses "hum" or "h" for humidity
    humidity =
      data.humidity !== undefined
        ? data.humidity
        : data.humid !== undefined
        ? data.humid
        : data.hum !== undefined
        ? data.hum
        : data.h !== undefined
        ? data.h
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

// Add new functions to query historical data
async function getBatteryHistory(deviceId, startTime, endTime, limit = 1000) {
  const query = { deviceId };

  if (startTime || endTime) {
    query.timestamp = {};
    if (startTime) query.timestamp.$gte = new Date(startTime);
    if (endTime) query.timestamp.$lte = new Date(endTime);
  }

  return BatteryHistory.find(query).sort({ timestamp: -1 }).limit(limit);
}

async function getDCPowerHistory(deviceId, startTime, endTime, limit = 1000) {
  const query = { deviceId };

  if (startTime || endTime) {
    query.timestamp = {};
    if (startTime) query.timestamp.$gte = new Date(startTime);
    if (endTime) query.timestamp.$lte = new Date(endTime);
  }

  return DCPowerHistory.find(query).sort({ timestamp: -1 }).limit(limit);
}

async function getDistanceHistory(deviceId, startTime, endTime, limit = 1000) {
  const query = { deviceId };

  if (startTime || endTime) {
    query.timestamp = {};
    if (startTime) query.timestamp.$gte = new Date(startTime);
    if (endTime) query.timestamp.$lte = new Date(endTime);
  }

  return DistanceHistory.find(query).sort({ timestamp: -1 }).limit(limit);
}

// Function to get latest temperature data by deviceId and optionally espDeviceId
async function getTemperatureData(deviceId, espDeviceId = null) {
  const query = { deviceId };

  // Add ESP device ID to query if provided
  if (espDeviceId) {
    query.espDeviceId = espDeviceId;
  }

  return Temperature.findOne(query).sort({ timestamp: -1 });
}

module.exports = {
  storeSensorData,
  storeTempData,
  getBatteryHistory,
  getDCPowerHistory,
  getDistanceHistory,
  getTemperatureData,
};
