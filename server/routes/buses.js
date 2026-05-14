const express = require('express');
const Bus = require('../models/Bus');
const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const buses = await Bus.find().populate('driverId');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buses' });
  }
});

router.post('/update-location', async (req, res) => {
  try {
    const { busId, lat, lng, speed, status } = req.body;
    const bus = await Bus.findByIdAndUpdate(
      busId,
      { 
        currentLocation: { lat, lng },
        speed,
        status,
        eta: '5 mins'
      },
      { new: true }
    );
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Error updating location' });
  }
});

module.exports = router;