const Alert = require('../models/Alert');

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate('vehicleId', 'busNumber').sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAlert = async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resolveAlert = async (req, res) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
