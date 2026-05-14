const Notification = require('../models/Notification');
const User = require('../models/User');
const Bus = require('../models/Bus');
const io = require('socket.io-client'); // For emitting

// Notification templates
const templates = {
  arrival: (busNumber, stopName) => ({
    title: '🚌 Bus Arrived',
    message: `Bus ${busNumber} has arrived at ${stopName}`,
    type: 'arrival',
    priority: 'high'
  }),
  
  delay: (busNumber, delayMinutes) => ({
    title: '⏰ Bus Delayed',
    message: `Bus ${busNumber} is delayed by ${delayMinutes} minutes`,
    type: 'delay',
    priority: 'high'
  }),
  
  emergency: (busNumber, location) => ({
    title: '🚨 EMERGENCY ALERT',
    message: `Emergency on bus ${busNumber} at ${location}`,
    type: 'emergency',
    priority: 'critical'
  }),
  
  boarding: (studentName, busNumber) => ({
    title: '✅ Student Boarded',
    message: `${studentName} has boarded bus ${busNumber}`,
    type: 'boarding',
    priority: 'medium'
  }),
  
  alighting: (studentName, stopName) => ({
    title: '👋 Student Alighted',
    message: `${studentName} got down at ${stopName}`,
    type: 'alighting',
    priority: 'medium'
  }),
  
  overcrowded: (busNumber, passengers, capacity) => ({
    title: '👥 Bus Overcrowded',
    message: `Bus ${busNumber}: ${passengers}/${capacity} passengers`,
    type: 'overcrowded',
    priority: 'high'
  })
};

// Send notification to single user
const sendToUser = async (userId, templateKey, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const template = templates[templateKey];
    if (!template) throw new Error('Invalid template');

    const notificationData = {
      userId: user._id,
      title: template.title(data.busNumber, data.stopName),
      message: template.message(data.busNumber, data.stopName),
      type: template.type,
      priority: template.priority,
      data: {
        busNumber: data.busNumber,
        stopName: data.stopName,
        studentName: data.studentName,
        ...data
      },
      busId: data.busId
    };

    const notification = await Notification.create(notificationData);
    
    // Emit real-time
    global.io.to(`user_${userId}`).emit('new-notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

// Send to all parents of students on a bus
const sendToBusParents = async (busId, templateKey, data = {}) => {
  try {
    const bus = await Bus.findById(busId).populate('driverId');
    if (!bus) return;

    // Get all students on this bus
    const students = await User.find({ 
      role: 'student', 
      busId: bus._id.toString() 
    });

    const notifications = [];
    for (let student of students) {
      // Get parents of student
      const parents = await User.find({ 
        role: 'parent',
        // parentOf contains this student (simplified)
      });
      
      for (let parent of parents) {
        const notif = await sendToUser(parent._id, templateKey, {
          busNumber: bus.busNumber,
          ...data
        });
        notifications.push(notif);
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Bus Parents Notification Error:', error);
  }
};

// Send emergency to all admins + parents
const sendEmergencyAlert = async (busId, location, message) => {
  try {
    const bus = await Bus.findById(busId);
    
    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (let admin of admins) {
      await sendToUser(admin._id, 'emergency', {
        busNumber: bus.busNumber,
        location,
        message
      });
    }
    
    // Notify bus parents
    await sendToBusParents(busId, 'emergency', {
      busNumber: bus.busNumber,
      location,
      message
    });
    
  } catch (error) {
    console.error('Emergency Alert Error:', error);
  }
};

// Get unread count for user
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    userId,
    status: 'unread'
  });
};

// Mark all as read for user
const markAllRead = async (userId) => {
  await Notification.updateMany(
    { userId, status: 'unread' },
    { status: 'read' }
  );
};

// Cleanup expired notifications (cron job)
const cleanupExpired = async () => {
  const result = await Notification.deleteMany({ expiresAt: { $lt: new Date() } });
  console.log(`🧹 Cleaned ${result.deletedCount} expired notifications`);
};

module.exports = {
  templates,
  sendToUser,
  sendToBusParents,
  sendEmergencyAlert,
  getUnreadCount,
  markAllRead,
  cleanupExpired
};