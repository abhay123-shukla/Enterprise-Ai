import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let useMemoryStore = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    useMemoryStore = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection error: ${error.message}`);
    console.log(`🚀 Operating in High-Performance Local In-Memory DB Mode for instant demonstration.`);
    isConnected = false;
    useMemoryStore = true;
    return null;
  }
};

export const getDbStatus = () => {
  const uri = ENV.MONGODB_URI || '';
  const maskedUri = uri.includes('@')
    ? uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')
    : uri;
  return {
    connected: isConnected,
    mode: useMemoryStore ? 'in-memory' : 'mongodb',
    uri: maskedUri
  };
};
