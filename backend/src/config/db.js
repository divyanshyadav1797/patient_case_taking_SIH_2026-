const mongoose = require('mongoose');
require('dotenv').config();

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quantum_care';
  
  try {
    // Attempt fast connection with a 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected Successfully: ${uri}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable (${error.message}).`);
    console.log('[Database] Active Mode: Resilient File-backed JSON Store (Backend/data/db.json). Zero crash, full persistence.');
  }
};

const getStatus = () => ({
  isMongoConnected,
  databaseType: isMongoConnected ? 'MongoDB' : 'LocalJSON'
});

module.exports = {
  connectDB,
  getStatus,
  get isConnected() {
    return isMongoConnected;
  }
};
