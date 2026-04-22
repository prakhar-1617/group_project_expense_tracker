const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  share: {
    type: Number,
    required: true,
    min: 0,
  },
  settled: {
    type: Boolean,
    default: false,
  }
});

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    paidBy: {
      type: String,
      required: [true, 'Paid By is required'],
      default: 'You'
    },
    splitType: {
      type: String,
      enum: ['equal', 'percentage', 'custom'],
      default: 'equal',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    participants: [participantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Split', splitSchema);
