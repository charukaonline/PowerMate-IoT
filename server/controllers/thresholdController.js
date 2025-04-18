const Threshold = require('../models/Threshold');

// Get user's threshold settings
const getUserThresholds = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find threshold settings for the user, or create default settings if none exist
        let thresholds = await Threshold.findOne({ userId });
        
        if (!thresholds) {
            // Create default threshold settings for new user
            thresholds = await Threshold.create({ userId });
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

// Update user's threshold settings
const updateUserThresholds = async (req, res) => {
    try {
        const userId = req.user._id;
        const updatedSettings = req.body;
        
        // Update the timestamp
        updatedSettings.updatedAt = new Date();
        
        // Find and update the user's settings
        const thresholds = await Threshold.findOneAndUpdate(
            { userId },
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
