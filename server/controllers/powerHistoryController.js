const DCPowerHistory = require('../models/DCPowerHistory');

// Get all power history records with optional pagination and date filtering
const getAllPowerHistory = async (req, res) => {
    try {
        const {page = 1, limit = 10, startDate, endDate} = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const records = await DCPowerHistory.find(query)
            .sort({timestamp: -1})
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DCPowerHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching power history records'
        });
    }
};

module.exports = {
    getAllPowerHistory
};