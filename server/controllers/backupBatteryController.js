const Battery = require('../models/Battery');
const BatteryHistory = require('../models/BatteryHistory');

// Get current battery data for a specific device or all devices
exports.getCurrentData = async (req, res) => {
    try {
        const { deviceId } = req.query;

        let query = {};
        if (deviceId) {
            query.deviceId = deviceId;
        }

        const currentData = await Battery.find(query).sort({ timestamp: -1 });

        // Calculate status for each record
        const dataWithStatus = currentData.map(record => {
            const { _id, deviceId, voltage, current, percentage, timestamp } = record;
            
            // Determine status based on percentage
            let status = 'Normal';
            if (percentage < 20) {
                status = 'Critical';
            } else if (percentage < 40) {
                status = 'Warning';
            }
            
            return {
                _id,
                deviceId,
                voltage,
                current,
                percentage,
                status,
                timestamp
            };
        });

        res.status(200).json({
            success: true,
            count: dataWithStatus.length,
            data: dataWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get historical battery data with filtering and pagination
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
        const history = await BatteryHistory.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await BatteryHistory.countDocuments(query);

        // Calculate status for each record
        const dataWithStatus = history.map(record => {
            const { _id, deviceId, voltage, current, percentage, timestamp } = record;
            
            // Determine status based on percentage
            let status = 'Normal';
            if (percentage < 20) {
                status = 'Critical';
            } else if (percentage < 40) {
                status = 'Warning';
            }
            
            return {
                _id,
                deviceId,
                voltage,
                current,
                percentage,
                status,
                timestamp
            };
        });

        res.status(200).json({
            success: true,
            count: dataWithStatus.length,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: dataWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Save new battery data (real-time and historical)
exports.saveData = async (req, res) => {
    try {
        const { deviceId, voltage, current, percentage } = req.body;

        if (!deviceId || voltage === undefined || current === undefined || percentage === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide deviceId, voltage, current, and percentage'
            });
        }

        // Update or create real-time record
        const realTimeData = await Battery.findOneAndUpdate(
            { deviceId },
            { voltage, current, percentage, timestamp: new Date() },
            { new: true, upsert: true }
        );

        // Add to historical data
        const historyData = await BatteryHistory.create({
            deviceId,
            voltage,
            current,
            percentage
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

// Get aggregated data for charts (with date filtering)
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
                    avgPercentage: { $avg: "$percentage" },
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
                    avgPercentage: { $avg: "$percentage" },
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
                    avgPercentage: { $avg: "$percentage" },
                    count: { $sum: 1 }
                }
            };
        }

        // Aggregate with appropriate grouping
        const chartData = await BatteryHistory.aggregate([
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
                    percentage: { $round: ["$avgPercentage", 0] },
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
