const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  routeId: { type: String, unique: true },
  bus: { type: String },
  driver: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  progress: { type: Number, default: 0 },
  lat: { type: Number, default: 28.6139 },
  lng: { type: Number, default: 77.2090 },
  stops: [{
    name: String,
    time: String,
    lat: Number,
    lng: Number,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
