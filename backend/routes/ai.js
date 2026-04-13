const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   POST /api/ai/categorize
router.post('/categorize', protect, (req, res) => {
  const { description } = req.body;
  const result = aiService.categorizeDescription(description);
  res.json({ success: true, ...result });
});

// @route   GET /api/ai/insights
router.get('/insights', protect, async (req, res) => {
  try {
    const result = await aiService.getInsights(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/ai/predict
router.get('/predict', protect, async (req, res) => {
  try {
    const result = await aiService.predictNextMonth(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let response = '';

    if (lowerMsg.includes('save')) {
      response = 'Try prioritizing your "Needs" and capping "Wants" at 30% of your income.';
    } else if (lowerMsg.includes('predict')) {
      response = 'The AI engine uses Linear Regression to project your next month based on the last 6 months.';
    } else {
      response = 'I am your FinTrack AI assistant. Ask me about your spending trends or saving tips!';
    }
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
