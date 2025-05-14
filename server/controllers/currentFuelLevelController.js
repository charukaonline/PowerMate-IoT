const Distance = require("../models/Distance");
const DistanceHistory = require("../models/DistanceHistory");

const getFuelLevel = async (req, res) => {
    try {
        const {deviceId} = req.params;

        const distanceData = await Distance.findOne({deviceId}).sort({timestamp: -1});

        if (!distanceData) {
            return res.status(404).json({
                success: false,
                message: "No distance data found for this device",
            });
        }

        const tankHeight = 20;
        const currentDistance = distanceData.distance;
        const fuelLevel = ((tankHeight - currentDistance) * 100) / tankHeight;

        return res.status(200).json({
            success: true,
            data: {
                deviceId: distanceData.deviceId,
                rawDistance: currentDistance,
                fuelLevelPercentage: Math.max(0, Math.min(100, fuelLevel)),
                timestamp: distanceData.timestamp,
            },
        });
    } catch (error) {
        console.error("Error fetching fuel level:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching fuel level data",
            error: error.message,
        });
    }
};

const getFuelLevelHistory = async (req, res) => {
    try {
        const {deviceId} = req.params;
        const {startDate, endDate} = req.query;

        const query = {deviceId};
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const distanceHistory = await DistanceHistory.find(query)
            .sort({timestamp: 1});

        if (!distanceHistory.length) {
            return res.status(404).json({
                success: false,
                message: "No historical data found for this device",
            });
        }

        const tankHeight = 20;
        const fuelLevelHistory = distanceHistory.map(record => ({
            deviceId: record.deviceId,
            rawDistance: record.distance,
            fuelLevelPercentage: Math.max(0, Math.min(100, ((tankHeight - record.distance) * 100) / tankHeight)),
            timestamp: record.timestamp,
        }));

        return res.status(200).json({
            success: true,
            data: fuelLevelHistory,
        });
    } catch (error) {
        console.error("Error fetching fuel level history:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching fuel level history data",
            error: error.message,
        });
    }
}

module.exports = {
    getFuelLevel,
    getFuelLevelHistory,
};