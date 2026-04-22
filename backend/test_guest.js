const mongoose = require('mongoose');
const User = require('./models/User');

async function testGuestLogin() {
  await mongoose.connect('mongodb://localhost:27017/expense_tracker');
  try {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const guestUser = await User.create({
      name: 'Guest User',
      email: `guest-${randomSuffix}@fintrack.app`,
      password: `guest-${randomSuffix}`,
      isGuest: true,
      monthlyBudget: 5000,
    });
    console.log("Success:", guestUser);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
}
testGuestLogin();
