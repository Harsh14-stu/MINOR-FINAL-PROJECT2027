const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// All endpoints hit by the Driver App
router.get('/dashboard', driverController.getDashboard);
router.post('/start-trip', driverController.startTrip);
router.post('/end-trip', driverController.endTrip);
router.post('/gps', driverController.updateLocation); // User mentioned POST /gps in their code!
router.post('/gps-update', driverController.updateLocation); // Fallback for our own api.js
router.post('/report', driverController.report);
router.post('/sos', driverController.sos);

module.exports = router;
