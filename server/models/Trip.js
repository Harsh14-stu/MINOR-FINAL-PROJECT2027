const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  currentStopIndex: { type: Number, default: 0 },
  locationHistory: [{
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  startTime: Date,
  endTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
