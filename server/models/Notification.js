const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Sender details (optional)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Bus reference (if bus-related)
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'arrival',      // Bus arrived at stop
      'delay',        // Bus delayed
      'emergency',    // Emergency alert
      'boarding',     // Student boarded
      'alighting',    // Student alighted
      'route_change', // Route deviation
      'maintenance',  // Bus maintenance
      'overcrowded'   // Bus overcrowded
    ],
    required: true
  },
  
  // Notification title
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Notification message/body
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Data payload (dynamic data)
  data: {
    stopName: String,
    eta: String,
    lat: Number,
    lng: Number,
    studentName: String,
    driverName: String,
    busNumber: String,
    delayMinutes: Number,
    currentPassengers: Number
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['unread', 'read', 'deleted'],
    default: 'unread'
  },
  
  // Delivery channels
  channels: [{
    type: { type: String, enum: ['push', 'email', 'sms', 'in-app'] },
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  
  // Location data (if location-based)
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  
  // Expiry (notifications auto-delete after)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
}, {
  timestamps: true,
  // Auto-delete expired notifications
  autoIndex: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware for validation
notificationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date()) {
    return next(new Error('Notification has expired'));
  }
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function({
  userId,
  type,
  title,
  message,
  data = {},
  priority = 'medium',
  busId = null,
  senderId = null
}) {
  const notification = new this({
    userId,
    type,
    title,
    message,
    data,
    priority,
    busId,
    senderId
  });
  
  await notification.save();
  return notification;
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status = 'read';
  this.channels.forEach(channel => channel.sent = true);
  await this.save();
  return this;
};

// Query helpers
notificationSchema.query.unread = function() {
  return this.where({ status: 'unread' });
};

notificationSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

notificationSchema.query.highPriority = function() {
  return this.where({ priority: { $in: ['high', 'critical'] } });
};

// Virtual for formatted data
notificationSchema.virtual('isUnread').get(function() {
  return this.status === 'unread';
});

notificationSchema.virtual('icon').get(function() {
  const icons = {
    arrival: '🚌',
    delay: '⏰',
    emergency: '🚨',
    boarding: '✅',
    alighting: '👋',
    route_change: '🛣️',
    maintenance: '🔧',
    overcrowded: '👥'
  };
  return icons[this.type] || '📱';
});

notificationSchema.virtual('color').get(function() {
  const colors = {
    low: 'blue',
    medium: 'orange',
    high: 'yellow',
    critical: 'red'
  };
  return colors[this.priority] || 'blue';
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);