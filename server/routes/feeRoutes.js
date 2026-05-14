const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(auth, adminOnly);

router.get('/', feeController.getAllFees);
router.post('/', feeController.createFee);
router.put('/:id/status', feeController.updateFeeStatus);

module.exports = router;
