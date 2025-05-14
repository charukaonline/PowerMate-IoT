// utils/generateTokenAndSetCookie.js
const jwt = require('jsonwebtoken')

function generateTokenAndSetCookie(res, userId) {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

module.exports = { generateTokenAndSetCookie }
