const express = require('express');
const router = express.Router();
const studentApiController = require('../controllers/studentApiController');
const auth = require('../middleware/auth');

// All endpoints hit by the Student App
router.use(auth); // Require authentication for all student routes

router.get('/dashboard', studentApiController.getDashboardData);
router.get('/notices', studentApiController.getNotices);
router.post('/report-issue', studentApiController.submitReport);
router.get('/qr-data', studentApiController.getQrData);

module.exports = router;
