const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  studentId: { type: String, unique: true },
  RFID: { type: String, unique: true },
  parentContact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBus: { type: String }, // Storing bus number string for simpler frontend mapping
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // New UI Fields
  photo: { type: String, default: 'S' },
  pickup: { type: String },
  drop: { type: String },
  phone: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  feeTotal: { type: Number, default: 12000 },
  feePaid: { type: Number, default: 0 },
  feeDue: { type: Number, default: 12000 },
  attendance: { type: Number, default: 100 },
  sos: { type: Boolean, default: false },
  history: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
