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

const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("Error in login", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in check auth", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

const myData = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user});
    } catch (error) {
        console.log("Error in myData", error);
        res.status(400).json({success: false, message: error.message});
    }
}

module.exports = {signup, login, logout, checkAuth, myData};