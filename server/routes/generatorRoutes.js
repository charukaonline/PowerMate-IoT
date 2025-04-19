const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');

// Fuel history route
router.get('/fuel-history', generatorController.getFuelHistory);

// Add more generator-related routes as needed:
// router.get('/status', generatorController.getStatus);
// router.post('/start', generatorController.startGenerator);
// router.post('/stop', generatorController.stopGenerator);

module.exports = router;
