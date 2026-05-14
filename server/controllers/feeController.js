const Fee = require('../models/Fee');

exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId', 'name class');
    res.json(fees);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    const newFee = new Fee(req.body);
    await newFee.save();
    res.status(201).json(newFee);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFeeStatus = async (req, res) => {
  try {
    const updated = await Fee.findByIdAndUpdate(req.params.id, { status: req.body.status, paidDate: req.body.status === 'paid' ? Date.now() : null }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
