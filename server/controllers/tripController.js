const Trip = require('../models/Trip');

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('routeId').populate('vehicleId');
    res.json(trips);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('routeId vehicleId');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTrip = async (req, res) => {
  try {
    const newTrip = new Trip(req.body);
    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTrip = async (req, res) => {
  try {
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteTrip = async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
