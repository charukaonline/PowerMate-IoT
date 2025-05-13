const Threshold = require('../models/Threshold');

/**
 * Get user threshold settings
 * @route GET /api/thresholds
 * @access Private
 */
exports.getUserThresholds = async (req, res) => {
    try {
        // Find thresholds for the authenticated user
        let userThresholds = await Threshold.findOne({ userId: req.user.id });

        // If no settings exist yet, create with defaults from the schema
        if (!userThresholds) {
            userThresholds = new Threshold({
                userId: req.user.id
                // Other fields will use default values defined in the schema
            });
            await userThresholds.save();
        }

        return res.status(200).json({
            success: true,
            data: {
                thresholds: userThresholds.thresholds
            }
        });
    } catch (error) {
        console.error('Error fetching threshold settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching threshold settings'
        });
    }
};

/**
 * Update user threshold settings
 * @route PUT /api/thresholds
 * @access Private
 */
exports.updateUserThresholds = async (req, res) => {
    try {
        const { thresholds } = req.body;

        if (!thresholds) {
            return res.status(400).json({
                success: false,
                message: 'No threshold data provided'
            });
        }

        // Validate the thresholds (optional, can be expanded)
        // Simple validation to ensure numeric values
        for (const category in thresholds) {
            for (const key in thresholds[category]) {
                if (typeof thresholds[category][key] !== 'number') {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid value for ${category}.${key}. Must be a number.`
                    });
                }
            }
        }

        // Update or create settings document
        const updateData = {
            thresholds,
            updatedAt: Date.now()
        };

        const options = {
            new: true,        // Return the updated document
            upsert: true,     // Create if it doesn't exist
            setDefaultsOnInsert: true // Apply schema defaults if creating
        };

        const updatedThresholds = await Threshold.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            options
        );

        return res.status(200).json({
            success: true,
            message: 'Threshold settings updated successfully',
            data: {
                thresholds: updatedThresholds.thresholds
            }
        });
    } catch (error) {
        console.error('Error updating threshold settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating threshold settings'
        });
    }
};
