const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Diagnostic check for deployment issues
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
      console.warn('⚠️  Warning: You are using a LOCALHOST URI. This will NOT work in deployment.');
      console.warn('👉 Please use a MongoDB Atlas URI for production.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
