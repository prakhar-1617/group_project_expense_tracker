const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

// @route   GET /api/transactions
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, limit = 100, page = 1 } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ transactions, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transactions
router.post('/', protect, async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      description,
      date: date || Date.now(),
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/transactions/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const { amount, type, category, description, date } = req.body;
    if (amount !== undefined) transaction.amount = amount;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = date;

    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/transactions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const { range } = req.query;
    const result = await analyticsService.getSummary(req.user._id, range);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/transactions/monthly-trend
router.get('/monthly-trend', protect, async (req, res) => {
  try {
    const result = await analyticsService.getMonthlyTrend(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
