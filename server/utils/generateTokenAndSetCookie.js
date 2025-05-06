const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, userId) => {
    // Create token using the same secret that will be used in verification
    const token = jwt.sign({ userId }, process.env.USER_JWT_SECRET || 'powermate-user-jwt-secret', {
        expiresIn: '30d',
    });

    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-site requests
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

module.exports = { generateTokenAndSetCookie };