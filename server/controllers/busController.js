const Bus = require('../models/Bus');
const User = require('../models/User');

// @desc    Get all buses with driver info
// @route   GET /api/buses
// @access  Private
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('driverId', 'name email phone')
      .sort({ busNumber: 1 });

    res.json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    console.error('Get Buses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buses'
    });
  }
};

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Private
const getBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driverId', 'name email phone');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: '🚌 Bus not found'
      });
    }

    res.json({
      success: true,
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus'
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private/Admin
const createBus = async (req, res) => {
  try {
    const { busNumber, driverId, route, capacity } = req.body;

    // Check if bus number exists
    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
      return res.status(400).json({
        success: false,
        message: '❌ Bus number already exists'
      });
    }

    // Check driver exists
    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== 'driver') {
        return res.status(400).json({
          success: false,
          message: '❌ Invalid driver ID'
        });
      }
    }

    const bus = new Bus({
      busNumber,
      driverId,
      route,
      capacity: capacity || 50
    });

    await bus.save();

    const populatedBus = await Bus.findById(bus._id).populate('driverId');

    res.status(201).json({
      success: true,
      message: '🚌 Bus created successfully!',
      bus: populatedBus
    });
  } catch (error) {
    console.error('Create Bus Error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating bus: ' + error.message
    });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: '🚌 Bus not found'
      });
    }

    // Update fields
    bus.busNumber = req.body.busNumber || bus.busNumber;
    bus.driverId = req.body.driverId || bus.driverId;
    bus.route = req.body.route || bus.route;
    bus.capacity = req.body.capacity || bus.capacity;
    bus.status = req.body.status || bus.status;

    const updatedBus = await bus.save();
    const populatedBus = await Bus.findById(updatedBus._id).populate('driverId');

    res.json({
      success: true,
      message: '🚌 Bus updated successfully!',
      bus: populatedBus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating bus: ' + error.message
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: '🚌 Bus not found'
      });
    }

    await bus.remove();

    res.json({
      success: true,
      message: '🗑️ Bus deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bus'
    });
  }
};

// @desc    Update bus location (Real-time GPS)
// @route   POST /api/buses/location
// @access  Private/Driver
const updateBusLocation = async (req, res) => {
  try {
    const { busId, lat, lng, speed, status, eta } = req.body;

    const bus = await Bus.findByIdAndUpdate(
      busId,
      {
        currentLocation: { lat, lng },
        speed: speed || 0,
        status: status || 'idle',
        eta: eta || 'N/A'
      },
      { new: true }
    ).populate('driverId');

    // Trigger real-time update via socket
    req.io.to(`bus_${busId}`).emit('location-update', {
      busId,
      location: { lat, lng },
      speed,
      status,
      eta
    });

    res.json({
      success: true,
      message: '📍 Location updated!',
      bus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating location'
    });
  }
};

module.exports = {
  getAllBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
  updateBusLocation
};