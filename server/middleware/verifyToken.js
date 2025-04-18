const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const verifyToken = async (req, res, next) => {
    try {
        console.log('Cookies:', req.cookies);
        console.log('Auth header:', req.headers.authorization);
        
        // Try to get token from multiple sources
        let token = null;
        
        // 1. Try to get from cookies
        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
            console.log('Found token in cookie');
        } 
        // 2. Try to get from authorization header
        else if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                console.log('Found token in Authorization header');
            } else {
                token = authHeader;
                console.log('Found raw token in Authorization header');
            }
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        console.log('Token found:', token.substring(0, 15) + '...');

        // Verify the token
        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET || 'powermate-user-jwt-secret');
        console.log('Decoded token:', decoded);

        // Get user ID from token
        const userId = decoded.userId;
        if (!userId) {
            console.log('No userId in token');
            return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
        }

        // Find the user
        const user = await User.findById(userId).select('-password');
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(401).json({ message: 'Unauthorized - Invalid user' });
        }

        // Set user on request object
        req.user = user;
        req.userId = userId;
        console.log('User authenticated:', user.name || user.email);
        
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

module.exports = { verifyToken };