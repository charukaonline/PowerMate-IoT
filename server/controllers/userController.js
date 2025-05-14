// controllers/userController.js
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');

// Update user profile (name and email)
const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken (only if email is being changed)
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
        }

        // Update user
        user.name = name;
        user.email = email;
        await user.save();

        // Return updated user without password
        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// Change user password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new passwords are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // Check if user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
};

module.exports = {
    updateUserProfile,
    changePassword
};