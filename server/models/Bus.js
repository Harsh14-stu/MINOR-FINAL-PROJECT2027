const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  speed: Number,
  status: { type: String, enum: ['idle', 'moving', 'stopped'], default: 'idle' },
  capacity: { type: Number, default: 50 },
  currentPassengers: { type: Number, default: 0 },
  eta: String,
  route: {
    name: String,
    stops: [{
      name: String,
      lat: Number,
      lng: Number
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);