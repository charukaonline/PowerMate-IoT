// powerController.js
const DCPower = require('../models/DCPower');

const getAllDCPowerData = async (req, res) => {
    try {
        const { page = 1, limit = 10, startTime, endTime } = req.query;
        const skip = (page - 1) * parseInt(limit);

        const query = {};
        if (startTime || endTime) {
            query.timestamp = {};
            if (startTime) query.timestamp.$gte = new Date(startTime);
            if (endTime) query.timestamp.$lte = new Date(endTime);
        }

        const data = await DCPower.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DCPower.countDocuments(query);

        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching DCPower data'
        });
    }
};

module.exports = {
    getAllDCPowerData
};