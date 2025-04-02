
import mongoose from 'mongoose';

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
    console.error('❌ Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://');
  }
  return valid;
};

// Function to handle MongoDB connection with retries
const connectWithRetry = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Please provide a MongoDB connection string.');
    throw new Error('MongoDB connection string not provided');
  }

  // Validate URI format
  if (!validateMongoURI(process.env.MONGODB_URI)) {
    console.error('❌ Invalid MongoDB URI format. Please check your connection string.');
    throw new Error('Invalid MongoDB URI format');
  }

  // Debug: Print the first 15 characters of the connection string to verify it without exposing credentials
  console.log(`🔍 MONGODB_URI starts with: ${process.env.MONGODB_URI.substring(0, 15)}...`);

  try {
    console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Successfully connected to MongoDB');
    retryCount = 0; // Reset retry counter on success
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('📌 Error details:', JSON.stringify(err, null, 2));
    
    if (retryCount < MAX_RETRIES - 1) {
      retryCount++;
      console.log(`⏳ Retrying connection in ${RETRY_INTERVAL / 1000} seconds...`);
      
      setTimeout(connectWithRetry, RETRY_INTERVAL);
    } else {
      console.error(`❌ Failed to connect after ${MAX_RETRIES} attempts. Application requires MongoDB to function.`);
      throw new Error('Failed to connect to MongoDB after multiple attempts');
    }
  }
};

// Set up connection monitoring
mongoose.connection.on('connected', () => {
  console.log('🔄 Mongoose connected to MongoDB server');
});

mongoose.connection.on('error', err => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB server');
  
  // Try to reconnect if disconnected, but only if we were previously connected
  if (retryCount === 0) {
    console.log('🔄 Attempting reconnection...');
    setTimeout(connectWithRetry, RETRY_INTERVAL);
  }
});

// Start the initial connection attempt
connectWithRetry();

// Export the connection for reuse
export const db = mongoose.connection;
