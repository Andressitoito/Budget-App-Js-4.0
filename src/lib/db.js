// lib/db.js
import mongoose from 'mongoose';

if (!process.env.MONGODB_BASE_URI) {
  throw new Error('Please define MONGODB_BASE_URI in .env.local');
}

const isProd = process.env.NODE_ENV === 'production';
const dbName = isProd ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;
const MONGODB_URI = `${process.env.MONGODB_BASE_URI}/${dbName}?retryWrites=true&w=majority`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    console.log(`Using cached connection to MongoDB database: ${dbName}`);
    return cached.conn;
  }

  if (!cached.promise) {
    // No deprecated options needed; modern driver handles these defaults
    const opts = {
      bufferCommands: false, // Disable buffering if connection fails
    };

    mongoose.set('strictQuery', true); // Enforce strict query mode (optional, keeps your current behavior)
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`Connected to MongoDB database: ${dbName}`);
      return mongoose;
    }).catch((error) => {
      // Ensure promise is reset on failure
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.conn = null; // Clear connection on failure
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}