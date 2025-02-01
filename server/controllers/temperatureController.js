const Temperature = require("../models/Temperature");

// POST - Store or Update Temperature and Humidity Data
const storeTemperature = async (req, res) => {
  try {
    const { temperatureC, temperatureF, humidity } = req.body;

    if (temperatureC == null || temperatureF == null || humidity == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let existingRecord = await Temperature.findOne();

    if (existingRecord) {
      // Update the existing record
      existingRecord.temperatureC = temperatureC;
      existingRecord.temperatureF = temperatureF;
      existingRecord.humidity = humidity;
      existingRecord.timestamp = new Date();
      await existingRecord.save();

      res
        .status(200)
        .json({ message: "Data updated successfully", data: existingRecord });
    } else {
      // If no record exists, create a new one
      const newTemperature = new Temperature({
        temperatureC,
        temperatureF,
        humidity,
        timestamp: new Date(),
      });
      await newTemperature.save();

      res
        .status(201)
        .json({ message: "Data stored successfully", data: newTemperature });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// GET - Retrieve Latest Temperature and Humidity Data
const getLatestTemperature = async (req, res) => {
  try {
    const latestData = await Temperature.findOne().sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(latestData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};

module.exports = { storeTemperature, getLatestTemperature };
