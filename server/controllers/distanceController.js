const Distance = require("../models/Distance");

// POST - Store Distance Data (Real-time Update)
const storeDistance = async (req, res) => {
  try {
    const { distance } = req.body;
    if (!distance)
      return res.status(400).json({ message: "Distance is required" });

    // Find the existing record (assuming only one document is stored)
    let existingDistance = await Distance.findOne();

    if (existingDistance) {
      // Update the existing record
      existingDistance.distance = distance;
      existingDistance.timestamp = new Date();
      await existingDistance.save();

      res.status(200).json({ message: "Data updated successfully", data: existingDistance });
    } else {
      // If no record exists, create a new one
      const newDistance = new Distance({ distance, timestamp: new Date() });
      await newDistance.save();

      res.status(201).json({ message: "Data stored successfully", data: newDistance });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// GET - Retrieve Latest Distance Data
const getLatestDistance = async (req, res) => {
  try {
    const latestDistance = await Distance.findOne().sort({ timestamp: -1 });
    if (!latestDistance) {
      return res.status(404).json({ message: "No data found" });
    }
    res.json(latestDistance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};


module.exports = { storeDistance, getLatestDistance };
