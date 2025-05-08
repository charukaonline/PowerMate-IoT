// temperatureController.js
const Temperature = require('../models/Temperature');

// Controller function to fetch temperature and humidity data
const getTemperatureData = async (req, res) => {
    try {
        const { deviceId } = req.query;

        // Build the filter object based on query parameters
        let filter = {};
        if (deviceId) {
            filter.deviceId = deviceId;
        }

        // Fetch data sorted by most recent timestamp
        const data = await Temperature.find(filter).sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        console.error("Error fetching temperature data:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch temperature data",
            error: error.message,
        });
    }
};

module.exports = {
    getTemperatureData,
};