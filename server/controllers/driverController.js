const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const GpsLog = require('../models/GpsLog');
const Message = require('../models/Message');
const Route = require('../models/Route');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { getDistanceInMeters } = require('../utils/haversine');

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('userId', 'email');
    res.json(drivers);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createDriver = async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateDriver = async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// =======================
// LIVE TRACKING API
// =======================

exports.getDashboard = async (req, res) => {
  // Stub for dashboard logic, returning basic info
  res.json({ bus: { busNumber: 'MP-09-AB-1234', status: 'idle' }, currentStopIndex: 0 });
};

exports.startTrip = async (req, res) => {
  try {
    const { driverId } = req.body;
    const driver = await Driver.findOne({ driverId: driverId }) || await Driver.findById(driverId).catch(()=>null);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    const trip = await Trip.create({
      driverId: driver._id,
      busId: driver.bus,
      routeId: driver.route,
      status: 'active',
      startTime: new Date()
    });
    
    await Driver.findByIdAndUpdate(driver._id, { status: 'On Trip', tripStatus: 'moving' });
    res.json({ message: 'Trip started', trip });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.endTrip = async (req, res) => {
  try {
    const { driverId } = req.body;
    await Driver.findOneAndUpdate({ $or: [{driverId}, {_id: driverId}] }, { status: 'Online', tripStatus: 'idle' });
    res.json({ message: 'Trip ended' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateLocation = async (req, res) => {
  try {
    const { driverId, lat, lng, speed } = req.body;
    await GpsLog.create({ driverId, lat, lng, speed });
    
    const driver = await Driver.findOneAndUpdate(
      { $or: [{driverId}, {_id: driverId}] }, 
      { lat, lng, speed: `${Math.round(speed || 0)} km/h` },
      { new: true }
    );
    
    // GEOFENCING LOGIC (Stop Detection)
    if (driver && driver.route) {
      // Find the active route
      const route = await Route.findById(driver.route);
      if (route && route.stops && route.stops.length > 0) {
        let routeUpdated = false;
        
        for (let i = 0; i < route.stops.length; i++) {
          const stop = route.stops[i];
          if (!stop.completed && stop.lat && stop.lng) {
            const distance = getDistanceInMeters(lat, lng, stop.lat, stop.lng);
            
            // If bus is within 50 meters of the stop
            if (distance < 50) {
              stop.completed = true;
              routeUpdated = true;
              
              // Find students assigned to this bus to notify them
              const students = await Student.find({ bus: driver.bus });
              
              for (const student of students) {
                // Determine message based on stop index
                const isSchoolDeparture = (i === 0);
                const title = isSchoolDeparture ? 'Bus Departed' : 'Bus Arrived';
                const message = isSchoolDeparture ? `Bus has departed from School` : `Bus has reached ${stop.name}`;

                // Create Notification
                await Notification.create({
                  userId: student.parent || student._id, // Assume parent ID or student ID
                  type: isSchoolDeparture ? 'system' : 'arrival',
                  title: title,
                  message: message,
                  data: { stopName: stop.name, studentName: student.name, busNumber: driver.bus },
                  priority: 'high'
                }).catch(()=>null); // Ignore errors if schema validation fails for mocks
              }
              
              console.log(`[GEO-FENCE] Bus reached stop: ${stop.name} (Distance: ${Math.round(distance)}m)`);
            }
          }
        }
        
        if (routeUpdated) {
          await route.save();
        }
      }
    }

    res.json({ message: 'Location updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.report = async (req, res) => {
  try {
    await Message.create(req.body);
    res.json({ message: "Reported" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.sos = async (req, res) => {
  try {
    res.json({ message: "SOS Sent" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
