const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: { type: String },
  busNumber: { type: String },
  type: { type: String, enum: ['breakdown', 'traffic', 'delay', 'emergency', 'route_change'], required: true },
  message: { type: String, required: true },
  sentTo: [{ type: String, enum: ['admin', 'parents'] }],
  status: { type: String, enum: ['unread', 'read', 'resolved'], default: 'unread' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
