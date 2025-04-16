const express = require('express');
const { signup } = require('../controllers/userAuthController');
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.post("/signup", signup);

module.exports = router;