const mongoose = require('mongoose');
require('dotenv').config();

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quantum-care';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('[Database] MongoDB Disconnected.');
});

mongoose.connection.on('error', (err) => {
  isMongoConnected = false;
  console.error('[Database] MongoDB Runtime Error:', err.message);
});

const getStatus = () => ({
  isMongoConnected: mongoose.connection.readyState === 1,
  databaseType: 'MongoDB',
  host: mongoose.connection.host || '127.0.0.1',
  name: mongoose.connection.name || 'quantum-care',
  readyState: mongoose.connection.readyState
});

module.exports = {
  connectDB,
  getStatus,
  get isConnected() {
    return mongoose.connection.readyState === 1;
  }
};
