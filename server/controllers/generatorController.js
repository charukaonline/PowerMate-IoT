const DistanceHistory = require("../models/DistanceHistory");
const Temperature = require("../models/Temperature");

exports.getFuelHistory = async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        
        // Build query object 
        const query = {};
        
        // Add date range filter if provided
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }
        
        // Fetch data from database
        const fuelHistory = await DistanceHistory.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean();
            
        // Return successful response
        res.status(200).json({
            success: true,
            count: fuelHistory.length,
            data: fuelHistory
        });

    } catch (error) {
        console.error("Error fetching fuel history:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch fuel history",
            error: error.message,
        });
    }
}

exports.getTemperature = async (req, res) => {
    try {
        const { deviceId } = req.query;
        
        // Build query object 
        const query = {};
        
        // Add deviceId filter if provided
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        // Fetch latest temperature data
        const temperatureData = await Temperature.findOne(query)
            .sort({ timestamp: -1 })
            .lean();
            
        if (!temperatureData) {
            return res.status(404).json({
                success: false,
                message: "No temperature data found",
            });
        }
        
        // Return successful response
        res.status(200).json({
            success: true,
            data: temperatureData
        });

    } catch (error) {
        console.error("Error fetching temperature data:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch temperature data",
            error: error.message,
        });
    }
}