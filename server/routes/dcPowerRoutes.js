// dcPowerRoutes.js
const express = require('express');
const { getAllDCPowerData } = require('../controllers/dcPowerController');

const router = express.Router();

// Route to get all DC Power data
router.get('/dc-current', getAllDCPowerData);

module.exports = router;