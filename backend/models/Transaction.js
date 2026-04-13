const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food',
        'Transport',
        'Shopping',
        'Entertainment',
        'Health',
        'Education',
        'Housing',
        'Utilities',
        'Travel',
        'Personal Care',
        'Investment',
        'Salary',
        'Freelance',
        'Business',
        'Gift',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
