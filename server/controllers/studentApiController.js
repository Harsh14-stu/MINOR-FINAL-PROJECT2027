const User = require('../models/User');
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const Report = require('../models/Report');
const jwt = require('jsonwebtoken');

exports.getDashboardData = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ targetAudience: { $in: ['student', 'all'] } })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ notices });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitReport = async (req, res) => {
  try {
    const { subject, description, image } = req.body;
    const report = new Report({
      studentId: req.user.id,
      subject,
      description,
      image
    });
    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getQrData = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Generate a short-lived token for the QR code (expires in 5 minutes)
    const qrToken = jwt.sign(
      { studentId: student.studentId, type: 'boarding_qr' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '5m' }
    );
    
    res.json({ token: qrToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
