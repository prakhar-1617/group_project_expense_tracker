require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracker';

async function seedMassive() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'prakharkumarcse@gmail.com';
    
    // Ensure user exists
    const user = await User.findOne({ email });
    if (!user) {
        console.error("User not found! Run seed_demo.js or register first.");
        process.exit(1);
    }

    // Wipe old transactions
    await Transaction.deleteMany({ user: user._id });
    console.log('Cleaned up previous transactions');

    const txns = [];
    const now = new Date();
    
    // Categories
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Housing', 'Personal Care'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift'];

    // Generate 12 months of robust data
    for (let i = 0; i < 365; i++) {
        // We will generate 0-3 transactions per day
        const txCount = Math.floor(Math.random() * 4);
        
        for (let j = 0; j < txCount; j++) {
            const txDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            // Randomize hour to spread out
            txDate.setHours(Math.floor(Math.random() * 24));
            
            // 90% chance expense, 10% chance income
            const isExpense = Math.random() < 0.9;
            
            if (isExpense) {
                const category = categories[Math.floor(Math.random() * categories.length)];
                // Base amount logic: Food (100-1000), Utilities (1000-5000), Shopping (500-10000), etc.
                let amount = 0;
                if (category === 'Food') amount = 100 + Math.random() * 800;
                else if (category === 'Utilities') amount = 1000 + Math.random() * 3000;
                else if (category === 'Housing') amount = 15000 + Math.random() * 5000;
                else if (category === 'Shopping') amount = 500 + Math.random() * 4000;
                else amount = 200 + Math.random() * 2000;

                // Add seasonal spikes (e.g. Shopping higher in last 30 days)
                if (category === 'Shopping' && i < 30) amount *= 1.5;

                txns.push({
                    user: user._id,
                    amount: Math.round(amount),
                    type: 'expense',
                    category: category,
                    description: `Generated ${category} expense`,
                    date: txDate
                });
            } else {
                const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
                let amount = 5000 + Math.random() * 45000;
                txns.push({
                    user: user._id,
                    amount: Math.round(amount),
                    type: 'income',
                    category: category,
                    description: `Generated ${category} income`,
                    date: txDate
                });
            }
        }
    }

    // Add explicit salary for each month for the past 12 months
    for (let month = 0; month < 12; month++) {
        const salaryDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
        txns.push({
            user: user._id,
            amount: 85000,
            type: 'income',
            category: 'Salary',
            description: 'Monthly Salary',
            date: salaryDate
        });
    }

    await Transaction.insertMany(txns);
    console.log(`Successfully seeded ${txns.length} transactions across 1 year.`);
    console.log('Massive Demo Account Ready!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedMassive();
