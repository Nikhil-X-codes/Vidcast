// src/db.js or wherever connectDB is defined
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not defined in environment variables");
  }

  try {
    await mongoose.connect(uri, {
      // modern mongoose ignores deprecated options; pooling and timeouts below
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 1),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
      heartbeatFrequencyMS: Number(process.env.MONGO_HEARTBEAT_MS || 10000),
      family: 4
    });
    mongoose.set('strictQuery', true);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;
