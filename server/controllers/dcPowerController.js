const DCPower = require('../models/DCPower');
const DCPowerHistory = require('../models/DCPowerHistory');

// Get current power data for a specific device or all devices
exports.getCurrentData = async (req, res) => {
    try {
        const { deviceId } = req.query;

        let query = {};
        if (deviceId) {
            query.deviceId = deviceId;
        }

        const currentData = await DCPower.find(query).sort({ timestamp: -1 });

        // Calculate power for each record
        const dataWithPower = currentData.map(record => {
            const { _id, deviceId, voltage, current, timestamp } = record;
            const power = (voltage * current).toFixed(2);
            return {
                _id,
                deviceId,
                voltage,
                current,
                power: Number(power),
                timestamp
            };
        });

        res.status(200).json({
            success: true,
            count: dataWithPower.length,
            data: dataWithPower
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get historical power data with filtering and pagination
exports.getHistoricalData = async (req, res) => {
    try {
        const { deviceId, startDate, endDate, page = 1, limit = 10 } = req.query;

        // Build query object
        let query = {};
        if (deviceId) query.deviceId = deviceId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination
        const history = await DCPowerHistory.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await DCPowerHistory.countDocuments(query);

        // Calculate power for each record
        const dataWithPower = history.map(record => {
            const { _id, deviceId, voltage, current, timestamp } = record;
            const power = (voltage * current).toFixed(2);
            return {
                _id,
                deviceId,
                voltage,
                current,
                power: Number(power),
                timestamp
            };
        });

        res.status(200).json({
            success: true,
            count: dataWithPower.length,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: dataWithPower
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Save new power data (real-time and historical)
exports.saveData = async (req, res) => {
    try {
        const { deviceId, voltage, current } = req.body;

        if (!deviceId || voltage === undefined || current === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide deviceId, voltage, and current'
            });
        }

        // Update or create real-time record
        const realTimeData = await DCPower.findOneAndUpdate(
            { deviceId },
            { voltage, current, timestamp: new Date() },
            { new: true, upsert: true }
        );

        // Add to historical data
        const historyData = await DCPowerHistory.create({
            deviceId,
            voltage,
            current
        });

        res.status(201).json({
            success: true,
            data: {
                realTime: realTimeData,
                history: historyData
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get aggregated data for charts with flexible time range
exports.getChartData = async (req, res) => {
    try {
        const { deviceId, startDate, endDate } = req.query;

        // Build date range query
        let query = {};
        if (deviceId) query.deviceId = deviceId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        } else {
            // Default to last 24 hours if no date range specified
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            query.timestamp = { $gte: oneDayAgo };
        }

        // Determine appropriate grouping based on date range
        let groupInterval = 'hour'; // Default to hour grouping
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dayDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
            
            if (dayDiff > 14) {
                groupInterval = 'day'; // Group by day for longer ranges
            } else if (dayDiff > 2) {
                groupInterval = 'hour4'; // 4-hour intervals for medium ranges
            }
        }

        // Set up grouping based on interval
        let groupStage;
        if (groupInterval === 'day') {
            groupStage = {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" }
                    },
                    deviceId: { $first: "$deviceId" },
                    avgVoltage: { $avg: "$voltage" },
                    avgCurrent: { $avg: "$current" },
                    count: { $sum: 1 }
                }
            };
        } else if (groupInterval === 'hour4') {
            groupStage = {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        hour: { 
                            $subtract: [
                                { $hour: "$timestamp" },
                                { $mod: [{ $hour: "$timestamp" }, 4] }
                            ]
                        }
                    },
                    deviceId: { $first: "$deviceId" },
                    avgVoltage: { $avg: "$voltage" },
                    avgCurrent: { $avg: "$current" },
                    count: { $sum: 1 }
                }
            };
        } else { // hourly grouping
            groupStage = {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        hour: { $hour: "$timestamp" }
                    },
                    deviceId: { $first: "$deviceId" },
                    avgVoltage: { $avg: "$voltage" },
                    avgCurrent: { $avg: "$current" },
                    count: { $sum: 1 }
                }
            };
        }

        // Aggregate with appropriate grouping
        const chartData = await DCPowerHistory.aggregate([
            { $match: query },
            groupStage,
            {
                $project: {
                    _id: 0,
                    deviceId: 1,
                    timestamp: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day",
                            hour: groupInterval === 'day' ? 0 : "$_id.hour"
                        }
                    },
                    voltage: { $round: ["$avgVoltage", 2] },
                    current: { $round: ["$avgCurrent", 2] },
                    power: {
                        $round: [{ $multiply: ["$avgVoltage", "$avgCurrent"] }, 2]
                    },
                    count: 1
                }
            },
            { $sort: { timestamp: 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: chartData.length,
            grouping: groupInterval,
            data: chartData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
