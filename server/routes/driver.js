const authMiddleware = require('../middleware/auth');
// Then use: router.use(authMiddleware);
const express = require('express');
const Bus = require('../models/Bus');
const router = express.Router();

// 🛡️ Middleware to protect driver routes
const driverAuth = (req, res, next) => {
  if (req.user?.role !== 'driver') {
    return res.status(403).json({ message: '❌ Driver access required' });
  }
  next();
};

// 🚌 Driver Dashboard
router.get('/dashboard', driverAuth, async (req, res) => {
  try {
    const bus = await Bus.findOne({ driverId: req.user.userId })
      .populate('route.stops');
    
    if (!bus) {
      return res.status(404).json({ message: 'No bus assigned to this driver' });
    }

    res.json({
      success: true,
      bus,
      driver: req.user,
      nextStop: bus.route?.stops?.[0],
      passengers: bus.currentPassengers,
      routeProgress: '45%'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard' });
  }
});

// 📍 Update GPS Location (Real-time)
router.post('/gps-update', driverAuth, async (req, res) => {
  try {
    const { lat, lng, speed, status, eta } = req.body;
    
    const bus = await Bus.findOneAndUpdate(
      { driverId: req.user.userId },
      {
        currentLocation: { lat, lng },
        speed: speed || 0,
        status: status || 'idle',
        eta: eta || 'N/A'
      },
      { new: true }
    );

    // Emit to Socket.IO for real-time tracking
    req.io.to(`bus_${bus._id}`).emit('bus-location', {
      busId: bus._id,
      location: { lat, lng },
      speed,
      status,
      eta
    });

    res.json({
      success: true,
      message: '📍 Location updated successfully!',
      bus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating GPS' });
  }
});

// 👥 Update Passenger Count
router.post('/passengers', driverAuth, async (req, res) => {
  try {
    const { currentPassengers, action } = req.body; // action: 'boarded' or 'dropped'
    
    const bus = await Bus.findOneAndUpdate(
      { driverId: req.user.userId },
      { 
        currentPassengers: action === 'boarded' ? currentPassengers + 1 : currentPassengers - 1 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `👤 Passenger ${action}`,
      bus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating passengers' });
  }
});

// 🚨 Send Emergency Alert
router.post('/emergency', driverAuth, async (req, res) => {
  try {
    const { message, location } = req.body;
    
    // Emit emergency to all connected clients
    req.io.emit('emergency-notification', {
      driverId: req.user.userId,
      message,
      location,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: '🚨 Emergency alert sent to all!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending emergency' });
  }
});

// 🛑 Mark Arrival at Stop
router.post('/arrival', driverAuth, async (req, res) => {
  try {
    const { stopName } = req.body;
    
    const bus = await Bus.findOne({ driverId: req.user.userId });
    
    res.json({
      success: true,
      message: `✅ Arrived at ${stopName}`,
      bus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking arrival' });
  }
});

// 📋 Get Assigned Route
router.get('/route', driverAuth, async (req, res) => {
  try {
    const bus = await Bus.findOne({ driverId: req.user.userId });
    res.json({
      success: true,
      route: bus?.route,
      currentStopIndex: 0,
      completedStops: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching route' });
  }
});

// 🔄 Start/End Trip
router.post('/trip/:action', driverAuth, async (req, res) => {
  try {
    const { action } = req.params; // 'start' or 'end'
    const bus = await Bus.findOneAndUpdate(
      { driverId: req.user.userId },
      { 
        status: action === 'start' ? 'moving' : 'idle',
        currentPassengers: action === 'end' ? 0 : 0
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `🚍 Trip ${action === 'start' ? 'started' : 'ended'} successfully!`,
      bus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error managing trip' });
  }
});

module.exports = router;