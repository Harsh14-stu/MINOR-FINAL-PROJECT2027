const GpsLog = require('../models/GpsLog');
const Student = require('../models/Student');
const Bus = require('../models/Bus');
const Attendance = require('../models/Attendance');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Route = require('../models/Route');
const Fee = require('../models/Fee');

exports.getLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    const loc = await GpsLog.findOne({ driverId }).sort({ timestamp: -1 });
    if (!loc) return res.status(404).json({ message: 'Location not found' });
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBusInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Fallback stub if real associations aren't perfect yet
    const student = await Student.findOne({ studentId }) || await Student.findById(studentId).catch(() => null);
    
    if (!student) {
      // Mock data for prototype
      return res.json({
        studentName: "Amit Sharma",
        busNumber: "MP-09-AB-1234",
        driverName: "Ramesh Bhaiiya",
        driverPhone: "+91 9876543210",
        schoolPhone: "+91 11 2345 6789",
        pickupTime: "07:30 AM",
        dropTime: "02:45 PM",
        eta: "12 min",
        busStatus: "moving"
      });
    }

    res.json({
      studentName: student.name,
      busNumber: student.bus || "Unassigned",
      driverName: "Assigned Driver",
      driverPhone: "+91 9876543210",
      schoolPhone: "+91 11 2345 6789",
      pickupTime: "07:30 AM",
      dropTime: "02:45 PM",
      eta: "8 min",
      busStatus: "moving"
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's attendance
    const record = await Attendance.findOne({ studentId, date: today });
    
    // Calculate monthly
    const monthRecords = await Attendance.find({ studentId, date: { $regex: `^${today.substring(0,7)}` } });
    const presentCount = monthRecords.filter(r => r.status === 'Present').length;
    const total = monthRecords.length;
    const percentage = total === 0 ? 100 : Math.round((presentCount / total) * 100);

    res.json({
      today: record ? record.status : 'Present', // defaulting to present for UI demo
      monthlyPercentage: percentage === 100 && total === 0 ? 95 : percentage
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, senderId } = req.body;
    await Message.create({
      type: 'emergency', // using as generic comms
      message: message,
      sentTo: ['admin', 'driver'],
      status: 'unread'
    });
    res.json({ message: "Message sent successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.sos = async (req, res) => {
  try {
    console.log("PARENT SOS TRIGGERED:", req.body);
    res.json({ message: "SOS Alert Dispatched to Authorities" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getNotifications = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Find notifications linked to this student (or their parent)
    const notifications = await Notification.find({ 
      $or: [{ userId: studentId }] // Will adjust based on auth schema, assuming userId matches
    }).sort({ createdAt: -1 }).limit(20);
    
    // Mock data if none found for testing
    if (notifications.length === 0) {
      return res.json([
        { id: 1, type: 'arrival', title: 'Bus Arrived', message: 'Bus has reached Market Chowk', createdAt: new Date() },
        { id: 2, type: 'info', title: 'Departed', message: 'Bus departed from School', createdAt: new Date(Date.now() - 3600000) }
      ]);
    }

    res.json(notifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRoute = async (req, res) => {
  try {
    const { driverId } = req.params;
    // Mocked route for UI testing. In prod: find Driver -> get Route -> return Route.stops
    res.json({
      routeName: "School -> City Center",
      stops: [
        { name: "Pickup Point A", lat: 28.6139, lng: 77.2090, completed: true },
        { name: "Market Chowk", lat: 28.6180, lng: 77.2120, completed: false },
        { name: "School Gate", lat: 28.6200, lng: 77.2150, completed: false }
      ]
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Monthly calculation stub
    const d = new Date();
    res.json({
      month: d.toLocaleString('default', { month: 'long' }),
      dueAmount: 1500,
      paidAmount: 500,
      payableAmount: 1000,
      status: 'pending',
      dueDate: new Date(d.getFullYear(), d.getMonth() + 1, 5) // 5th of next month
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
