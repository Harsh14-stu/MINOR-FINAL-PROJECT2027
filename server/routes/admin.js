const authMiddleware = require('../middleware/auth');
// Then use: router.use(authMiddleware);
const express = require('express');
const Bus = require('../models/Bus');
const User = require('../models/User');
const router = express.Router();

// 🛡️ Middleware to protect admin routes
const adminAuth = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '❌ Admin access required' });
  }
  next();
};

// 📊 Get Dashboard Analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const activeBuses = await Bus.countDocuments({ status: 'moving' });

    const analytics = {
      totalBuses,
      totalDrivers,
      totalStudents,
      totalParents,
      activeBuses,
      buses: await Bus.find().populate('driverId', 'name email'),
      recentAlerts: [] // Add emergency notifications here
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// 🚌 Manage Buses - Create New Bus
router.post('/buses', adminAuth, async (req, res) => {
  try {
    const bus = new Bus({
      busNumber: req.body.busNumber,
      driverId: req.body.driverId,
      route: req.body.route,
      capacity: req.body.capacity || 50
    });
    
    await bus.save();
    res.status(201).json({ 
      success: true, 
      message: '🚌 New bus created successfully!',
      bus 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating bus: ' + error.message });
  }
});

// 🚌 Get All Buses
router.get('/buses', adminAuth, async (req, res) => {
  try {
    const buses = await Bus.find().populate('driverId', 'name email phone');
    res.json({
      success: true,
      buses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buses' });
  }
});

// 🚌 Update Bus
router.put('/buses/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('driverId');
    
    res.json({
      success: true,
      message: '🚌 Bus updated successfully!',
      bus
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating bus' });
  }
});

// 🚌 Delete Bus
router.delete('/buses/:id', adminAuth, async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: '🗑️ Bus deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bus' });
  }
});

// 👨‍💼 Manage Users - Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .populate('parentOf', 'name studentId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 👨‍💼 Create New User (Driver/Student/Parent)
router.post('/users', adminAuth, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || 'default123', // Auto-generate
      role: req.body.role,
      phone: req.body.phone,
      studentId: req.body.studentId,
      busId: req.body.busId,
      emergencyContact: req.body.emergencyContact
    });
    
    await user.save();
    res.status(201).json({ 
      success: true, 
      message: `👤 New ${req.body.role} created!`,
      user 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user: ' + error.message });
  }
});

// 👨‍💼 Update User
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        password: req.body.password ? req.body.password : undefined
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: '👤 User updated successfully!',
      user
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
});

// 👨‍💼 Delete User
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: '👤 User deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// 📈 Get Reports
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reports = {
      dailyTrips: 45,
      totalStudentsTransported: 1200,
      avgETA: '12 mins',
      delayPercentage: '5%'
    };
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports' });
  }
});

module.exports = router;