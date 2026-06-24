const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

async function connectDB(retries = MAX_RETRIES) {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (err) {
    if (retries > 0) {
      logger.warn(`MongoDB connection failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    logger.error('MongoDB connection failed after max retries:', err);
    throw err;
  }
}

module.exports = { connectDB };
