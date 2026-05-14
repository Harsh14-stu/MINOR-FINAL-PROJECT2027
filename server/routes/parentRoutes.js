const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.get('/location/:driverId', parentController.getLocation);
router.get('/bus/:studentId', parentController.getBusInfo);
router.get('/attendance/:studentId', parentController.getAttendance);
router.get('/notifications/:studentId', parentController.getNotifications);
router.get('/route/:driverId', parentController.getRoute);
router.get('/fees/:studentId', parentController.getFees);
router.post('/message', parentController.sendMessage);
router.post('/sos', parentController.sos);

module.exports = router;
