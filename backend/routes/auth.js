const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Split = require('../models/Split');
const { protect } = require('../middleware/auth');
const { sendOTPEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const buildUserNotifications = async (userId, monthlyBudget) => {
  const notifications = [];
  const expenseCount = await Transaction.countDocuments({ user: userId });

  if (expenseCount === 0) {
    notifications.push('You have not added any expenses yet. Add your first transaction to start tracking your spending.');
  }

  if (!monthlyBudget || monthlyBudget === 0) {
    notifications.push('Set a monthly budget to get better spending insights and alerts.');
  }

  return notifications;
};

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phoneNumber').custom((value) => {
      const sanitized = value.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?[1-9]\d{1,14}$/.test(sanitized)) {
        throw new Error('Valid international phone number required');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phoneNumber } = req.body;
    try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'User already exists' });

      const user = await User.create({ name, email, password, phoneNumber });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        // Check verification for real users (not guests)
        if (!user.isGuest && (!user.emailVerified || !user.phoneVerified)) {
          return res.status(403).json({
            message: 'Verification required',
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            email: user.email,
          });
        }

        const notifications = await buildUserNotifications(user._id, user.monthlyBudget);

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          monthlyBudget: user.monthlyBudget,
          token: generateToken(user._id),
          notifications,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   POST /api/auth/send-otp
// @desc    Generate and "send" OTP (simulated via console)
router.post('/send-otp', async (req, res) => {
  const { email, type } = req.body; // type: 'email' or 'phone'
  if (!email || !type) {
    return res.status(400).json({ message: 'Email and type are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Null-safe access — otp sub-doc may not exist on brand-new accounts
    const existingOtp = user.otp || {};

    // 30s cooldown check
    if (existingOtp.lastSent && (new Date() - new Date(existingOtp.lastSent) < 30000)) {
      return res.status(429).json({ message: 'Please wait 30 seconds before requesting a new OTP' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: otpCode,
      expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
      attempts: 0,
      lastSent: new Date(),
    };
    await user.save();

    // Send OTP — real Gmail if credentials exist, console fallback otherwise
    // For 'email' type: send to user's email
    // For 'phone' type: also send to email (no SMS provider configured yet)
    await sendOTPEmail(email, otpCode, type);

    res.json({ message: `OTP sent successfully to your ${type}` });
  } catch (error) {
    console.error('send-otp error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and update user verification status
router.post('/verify-otp', async (req, res) => {
  const { email, code, type } = req.body;
  if (!email || !code || !type) {
    return res.status(400).json({ message: 'Email, code, and type are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Null-safe check — otp sub-doc may not exist on fresh accounts
    const otp = user.otp || {};

    if (!otp.code || !otp.expiry || new Date(otp.expiry) < new Date()) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if ((otp.attempts || 0) >= 3) {
      return res.status(400).json({ message: 'Max attempts reached. Please request a new OTP.' });
    }

    if (otp.code !== code) {
      user.otp.attempts = (otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: `Invalid OTP. ${3 - user.otp.attempts} attempts remaining.` });
    }

    // Success — mark verified
    if (type === 'email') user.emailVerified = true;
    if (type === 'phone') user.phoneVerified = true;

    // Clear OTP after successful verification
    user.otp = { code: undefined, expiry: undefined, attempts: 0, lastSent: otp.lastSent };

    await user.save();

    res.json({
      message: `${type} verified successfully`,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      token: (user.emailVerified && user.phoneVerified) ? generateToken(user._id) : undefined,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        monthlyBudget: user.monthlyBudget,
        isGuest: user.isGuest,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const notifications = await buildUserNotifications(req.user._id, req.user.monthlyBudget);
  res.json({ ...req.user.toObject(), notifications });
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      monthlyBudget: updated.monthlyBudget,
      token: generateToken(updated._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/contacts
// @desc    Add a contact to user's saved list
router.post('/contacts', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if contact already exists
    if (user.contacts.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Contact already exists' });
    }

    user.contacts.push({ name, email });
    await user.save();
    
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/auth/contacts/:email
// @desc    Remove a contact from user's saved list
router.delete('/contacts/:email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.contacts = user.contacts.filter(c => c.email.toLowerCase() !== req.params.email.toLowerCase());
    await user.save();

    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/guest-login
// @desc    Create a temporary guest user and login
router.post('/guest-login', async (req, res) => {
  try {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const guestUser = await User.create({
      name: 'Guest User',
      email: `guest-${randomSuffix}@fintrack.app`,
      password: `guest-${randomSuffix}`,
      isGuest: true,
      monthlyBudget: 0,
    });
    res.status(201).json({
      _id: guestUser._id,
      name: guestUser.name,
      email: guestUser.email,
      isGuest: guestUser.isGuest,
      monthlyBudget: guestUser.monthlyBudget,
      token: generateToken(guestUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/auth/me
// @desc    Delete current user and associated data (used for guest cleanup)
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await Transaction.deleteMany({ user: userId });
    await Split.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
