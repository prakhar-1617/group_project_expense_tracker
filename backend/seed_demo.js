require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracker';

async function seedUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'prakharkumarcse@gmail.com';
    const password = '12345678';
    
    // Cleanup existing data for this user if any
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        await Transaction.deleteMany({ user: existingUser._id });
        await User.deleteOne({ _id: existingUser._id });
        console.log('Cleaned up existing user data');
    }

    // Create User
    const user = await User.create({
      name: 'prakhar kumar',
      email: email,
      password: password, // Schema will hash it via pre-save hook
      phoneNumber: '+918115301987',
      emailVerified: true,
      phoneVerified: true
    });

    console.log('User created and verified:', user.email);

    const txns = [];
    const now = new Date();

    // 1. Historical Data (Last 5 months) to trigger Linear Regression
    // Month 1: 5000, Month 2: 5500, Month 3: 6200, Month 4: 7000, Month 5: 8100
    // This creates a clear upward trend
    const baseAmounts = [5000, 5500, 6200, 7000, 8100];
    baseAmounts.forEach((total, i) => {
        const monthOffset = 5 - i;
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15);
        
        txns.push({
            user: user._id,
            amount: total,
            type: 'expense',
            category: 'Food',
            description: `Monthly Groceries - Month ${i+1}`,
            date: date
        });
        
        // Add some income too
        txns.push({
            user: user._id,
            amount: 15000,
            type: 'income',
            category: 'Salary',
            description: 'Monthly Salary',
            date: date
        });
    });

    // 2. Velocity Data (Today vs Same Day Last Month)
    // Same day last month: 500
    const lastMonthDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    txns.push({
        user: user._id,
        amount: 500,
        type: 'expense',
        category: 'Transport',
        description: 'Fuel Refill',
        date: lastMonthDay
    });

    // Today: 1500 (300% velocity spike - triggers CRITICAL alert)
    txns.push({
        user: user._id,
        amount: 1500,
        type: 'expense',
        category: 'Transport',
        description: 'Premium Fuel & Car Wash',
        date: now
    });

    // 3. Current Month diversity
    txns.push({
        user: user._id,
        amount: 2500,
        type: 'expense',
        category: 'Shopping',
        description: 'Amazon Purchase - Electronics',
        date: now
    });

    txns.push({
        user: user._id,
        amount: 900,
        type: 'expense',
        category: 'Entertainment',
        description: 'Netflix & Movie Night',
        date: now
    });

    await Transaction.insertMany(txns);
    console.log(`Successfully seeded ${txns.length} transactions.`);
    console.log('Demo Account Ready!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedUser();
