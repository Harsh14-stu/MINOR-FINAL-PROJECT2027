const User = require('../models/User');
const Bus = require('../models/Bus');

// @desc    Admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const stats = {
      totalBuses: await Bus.countDocuments(),
      activeBuses: await Bus.countDocuments({ status: 'moving' }),
      totalDrivers: await User.countDocuments({ role: 'driver' }),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalParents: await User.countDocuments({ role: 'parent' }),
      recentTrips: await Bus.find({ status: 'moving' }).limit(5),
      alerts: [] // Emergency notifications
    };

    // Recent buses with drivers
    stats.recentBuses = await Bus.find()
      .populate('driverId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('parentOf', 'name studentId')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Create user by admin
// @route   POST /api/admin/users
// @access  Private/Admin
const createAdminUser = async (req, res) => {
  try {
    const { name, email, role, phone, studentId, busId, emergencyContact } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: '❌ User already exists'
      });
    }

    const user = new User({
      name,
      email,
      password: 'default123', // Admin sets password later
      role,
      phone,
      studentId,
      busId,
      emergencyContact
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: `✅ ${role} created successfully!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating user: ' + error.message
    });
  }
};

// @desc    Delete user by admin
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '👤 User not found'
      });
    }

    // Can't delete admin itself
    if (user.role === 'admin' && user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '❌ Cannot delete yourself'
      });
    }

    await user.remove();

    res.json({
      success: true,
      message: '👤 User deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get analytics reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const reports = {
      monthlyTrips: Math.floor(Math.random() * 500) + 200,
      totalStudents: await User.countDocuments({ role: 'student' }),
      avgSpeed: '42 km/h',
      delayPercentage: `${Math.floor(Math.random() * 10)}%`,
      peakHours: ['7:30 AM', '4:00 PM']
    };

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating reports'
    });
  }
};

// @desc    Assign driver to bus
// @route   POST /api/admin/assign-driver
// @access  Private/Admin
const assignDriverToBus = async (req, res) => {
  try {
    const { busId, driverId } = req.body;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid driver'
      });
    }

    const bus = await Bus.findByIdAndUpdate(
      busId,
      { driverId },
      { new: true }
    ).populate('driverId');

    res.json({
      success: true,
      message: '✅ Driver assigned to bus successfully!',
      bus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error assigning driver'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  createAdminUser,
  deleteUser,
  getReports,
  assignDriverToBus
};