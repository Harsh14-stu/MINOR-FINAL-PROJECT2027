const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  driverId: { type: String, unique: true },
  license: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Driving License Details
  licenseImage: { type: String }, // Base64 string
  licenseExpiry: { type: Date },
  dlStatus: { type: String, enum: ['Verified', 'Pending'], default: 'Pending' },
  
  // New UI Fields
  experience: { type: String },
  bus: { type: String }, // Storing bus string for UI
  route: { type: String },
  photo: { type: String, default: 'D' },
  status: { type: String, enum: ['Online', 'Offline', 'On Trip'], default: 'Offline' },
  tripStatus: { type: String, default: 'Off duty' },
  currentStop: { type: String, default: '-' },
  nextStop: { type: String, default: '-' },
  speed: { type: String, default: '0 km/h' },
  lat: { type: Number, default: 28.6139 },
  lng: { type: Number, default: 77.2090 },
  history: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
