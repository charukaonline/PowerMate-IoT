const express = require('express');
const router = express.Router();
const currentFuelLevelController = require('../controllers/currentFuelLevelController');

router.get('/fuel-level/:deviceId', currentFuelLevelController.getFuelLevel);

router.get('/fuel-level-history/:deviceId', currentFuelLevelController.getFuelLevelHistory);

module.exports = router;