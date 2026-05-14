const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  fuelLevel: { type: Number, default: 100 }, // Percentage
  status: { type: String, enum: ['idle', 'active', 'maintenance'], default: 'idle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  capacity: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
