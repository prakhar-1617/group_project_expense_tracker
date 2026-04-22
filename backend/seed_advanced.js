require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracker';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 
  'Education', 'Housing', 'Utilities', 'Travel', 'Personal Care', 
  'Investment', 'Salary', 'Freelance', 'Business', 'Gift', 'Other'
];

async function seedFaker() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: 'prakharkumarcse@gmail.com' });
    
    if (!user) {
      console.error('User not found. Please run seed_demo.js first.');
      process.exit(1);
    }

    // Clean up existing transactions for a fresh fake state
    await Transaction.deleteMany({ user: user._id });
    console.log('Old transactions cleared.');

    const transactions = [];
    const now = new Date();

    // 1. Generate 80 Random Transactions across all categories
    for (let i = 0; i < 80; i++) {
      const type = faker.helpers.arrayElement(['expense', 'expense', 'expense', 'income']); // 3:1 expense ratio
      const category = type === 'income' 
        ? faker.helpers.arrayElement(['Salary', 'Freelance', 'Business', 'Gift'])
        : faker.helpers.arrayElement(CATEGORIES.filter(c => !['Salary', 'Freelance', 'Business'].includes(c)));
      
      const date = faker.date.recent({ days: 170 }); // Last 6 months
      
      transactions.push({
        user: user._id,
        amount: parseFloat(faker.finance.amount({ min: 50, max: 8000 })),
        type,
        category,
        description: faker.commerce.productName() + ' (' + faker.company.name() + ')',
        date
      });
    }

    // 2. FORCE a trend for AI Prediction (Increasing Expenses)
    // We add specific high-value expenses for each month to ensure the regression slope is positive
    for (let m = 5; m >= 1; m--) {
        const date = new Date(now.getFullYear(), now.getMonth() - m, 10);
        transactions.push({
            user: user._id,
            amount: 10000 + ( (5-m) * 2000 ), // 10k, 12k, 14k, 16k, 18k...
            type: 'expense',
            category: 'Housing',
            description: 'Monthly Maintenance & Rent',
            date: date
        });
        // Add a primary income source for each month
        transactions.push({
            user: user._id,
            amount: 35000,
            type: 'income',
            category: 'Salary',
            description: 'Corporate Salary Credit',
            date: date
        });
    }

    // 3. FORCE a Velocity Spike for TODAY
    const yesterdayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    transactions.push({
        user: user._id,
        amount: 200,
        type: 'expense',
        category: 'Food',
        description: 'Small Snack',
        date: yesterdayLastMonth
    });

    transactions.push({
        user: user._id,
        amount: 4500, // MASSIVE SPIKE vs 200
        type: 'expense',
        category: 'Food',
        description: 'Grand Luxury Dinner Party',
        date: now
    });

    await Transaction.insertMany(transactions);
    console.log(`Successfully seeded ${transactions.length} advanced transactions with Faker.`);
    console.log('All categories covered. AI Engines strictly tuned.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedFaker();
