
import mongoose from 'mongoose';
import logger from './logger'; // Import pino logger

// Connection retry settings
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds
let retryCount = 0;

// Function to validate MongoDB URI
const validateMongoURI = (uri: string): boolean => {
  // Basic validation for MongoDB URI format
  const uriPattern = /^mongodb(\+srv)?:\/\/.+/;
  const valid = uriPattern.test(uri);
  
  if (!valid) {
    logger.error('❌ Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://');
  }
  return valid;
};

// Function to handle MongoDB connection with retries
const connectWithRetry = async () => {
  if (!process.env.MONGODB_URI) {
    logger.error('❌ MONGODB_URI not set. Please provide a MongoDB connection string.');
    throw new Error('MongoDB connection string not provided');
  }

  // Validate URI format
  if (!validateMongoURI(process.env.MONGODB_URI)) {
    logger.error('❌ Invalid MongoDB URI format. Please check your connection string.');
    throw new Error('Invalid MongoDB URI format');
  }

  // Debug: Print the first 15 characters of the connection string to verify it without exposing credentials
  logger.info(`🔍 MONGODB_URI starts with: ${process.env.MONGODB_URI.substring(0, 15)}...`);

  try {
    logger.info(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });
    
    logger.info('✅ Successfully connected to MongoDB');
    retryCount = 0; // Reset retry counter on success
  } catch (err: any) {
    logger.error({ err }, '❌ MongoDB connection error:');
    // logger.info('📌 Error details:', JSON.stringify(err, null, 2)); // Pino will serialize err object
    
    if (retryCount < MAX_RETRIES - 1) {
      retryCount++;
      logger.info(`⏳ Retrying connection in ${RETRY_INTERVAL / 1000} seconds...`);
      
      setTimeout(connectWithRetry, RETRY_INTERVAL);
    } else {
      logger.error(`❌ Failed to connect after ${MAX_RETRIES} attempts. Application requires MongoDB to function.`);
      throw new Error('Failed to connect to MongoDB after multiple attempts');
    }
  }
};

// Set up connection monitoring
mongoose.connection.on('connected', () => {
  logger.info('🔄 Mongoose connected to MongoDB server');
});

mongoose.connection.on('error', (err: any) => {
  logger.error({ err }, '❌ Mongoose connection error:');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Mongoose disconnected from MongoDB server');
  
  // Try to reconnect if disconnected, but only if we were previously connected
  if (retryCount === 0) {
    logger.info('🔄 Attempting reconnection...');
    setTimeout(connectWithRetry, RETRY_INTERVAL);
  }
});

// Start the initial connection attempt
connectWithRetry();

// Export the connection for reuse
export const db = mongoose.connection;
