const Route = require('../models/Route');

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRoute = async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateRoute = async (req, res) => {
  try {
    const updated = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRoute = async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ message: 'Route deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
