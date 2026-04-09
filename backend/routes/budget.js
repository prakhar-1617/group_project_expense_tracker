const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/budget
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('monthlyBudget currency');
    res.json({ monthlyBudget: user.monthlyBudget, currency: user.currency });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/budget
router.put('/', protect, async (req, res) => {
  try {
    const { monthlyBudget, currency } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    if (currency) user.currency = currency;

    await user.save();
    res.json({ monthlyBudget: user.monthlyBudget, currency: user.currency, message: 'Budget updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
