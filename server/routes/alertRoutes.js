const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(auth, adminOnly);

router.get('/', alertController.getAllAlerts);
router.post('/', alertController.createAlert);
router.put('/:id/resolve', alertController.resolveAlert);

module.exports = router;
