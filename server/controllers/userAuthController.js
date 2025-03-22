const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const { User } = require("../models/User");
const { generateTokenAndSetCookie } = require("../utils/generateTokenAndSetCookie");

const signup = async (req, res) => {

    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error('All fields are required');
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            name,
        })

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { signup };