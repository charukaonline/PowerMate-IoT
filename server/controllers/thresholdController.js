const Threshold = require('../models/Threshold');

// Get user's threshold settings (without user ID comparison)
const getUserThresholds = async (req, res) => {
    try {
        let thresholds = await Threshold.findOne();

        if (!thresholds) {
            thresholds = await Threshold.create({});
        }

        res.status(200).json({
            success: true,
            data: thresholds
        });
    } catch (error) {
        console.error('Error getting threshold settings:', error);
        res.status(500).json({
            success: false,
            message: 'Could not retrieve threshold settings',
            error: error.message
        });
    }
};

// Update user's threshold settings (without user ID comparison)
const updateUserThresholds = async (req, res) => {
    try {
        const updatedSettings = req.body;

        updatedSettings.updatedAt = new Date();

        const thresholds = await Threshold.findOneAndUpdate(
            {},
            updatedSettings,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Threshold settings updated successfully',
            data: thresholds
        });
    } catch (error) {
        console.error('Error updating threshold settings:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update threshold settings',
            error: error.message
        });
    }
};

module.exports = {
    getUserThresholds,
    updateUserThresholds
};