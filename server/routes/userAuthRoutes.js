const express = require('express');
const { signup, login, logout, checkAuth } = require('../controllers/userAuthController');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;