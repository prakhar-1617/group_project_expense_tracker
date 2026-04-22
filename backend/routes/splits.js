const express = require('express');
const router = express.Router();
const Split = require('../models/Split');
const User = require('../models/User'); // We might need this if we auto-add contacts
const { protect } = require('../middleware/auth');

// @route   GET /api/splits
// @desc    Get all splits for a user
router.get('/', protect, async (req, res) => {
  try {
    const splits = await Split.find({ user: req.user._id }).sort({ date: -1 });
    res.json(splits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/splits
// @desc    Create a new split expense
router.post('/', protect, async (req, res) => {
  try {
    const { title, totalAmount, paidBy, splitType, participants, date } = req.body;
    
    const split = await Split.create({
      user: req.user._id,
      title,
      totalAmount,
      paidBy,
      splitType,
      date: date || Date.now(),
      participants
    });

    res.status(201).json(split);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/splits/:id
// @desc    Delete a split
router.delete('/:id', protect, async (req, res) => {
  try {
    const split = await Split.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!split) return res.status(404).json({ message: 'Split not found' });
    res.json({ message: 'Split removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/splits/:id/settle
// @desc    Toggle a participant's settled status
router.put('/:id/settle', protect, async (req, res) => {
  try {
    const { participantEmail } = req.body;
    
    const split = await Split.findOne({ _id: req.params.id, user: req.user._id });
    if (!split) return res.status(404).json({ message: 'Split not found' });

    // Find the specific participant and toggle their "settled" status
    const participantIndex = split.participants.findIndex(p => p.email === participantEmail);
    
    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found in this split' });
    }

    split.participants[participantIndex].settled = !split.participants[participantIndex].settled;
    await split.save();

    res.json(split);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
