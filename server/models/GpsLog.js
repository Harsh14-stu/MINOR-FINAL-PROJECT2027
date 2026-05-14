const mongoose = require('mongoose');

const gpsLogSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GpsLog', gpsLogSchema);
