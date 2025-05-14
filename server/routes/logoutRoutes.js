const express = require('express');
const { signup, login, logout, checkAuth, myData} = require('../controllers/userAuthController');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.get("/logout", logout);

router.get("/me", verifyToken, myData);

module.exports = router;