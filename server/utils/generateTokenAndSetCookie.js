const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, userId) => {
    // Create token
    const token = jwt.sign({ userId }, process.env.USER_JWT_SECRET, {
        expiresIn: '30d',
    });

    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

module.exports = { generateTokenAndSetCookie };