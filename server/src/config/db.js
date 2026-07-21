import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function connectDB() {
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/securewatch';
  
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected to ${uri}`);
  } catch (err) {
    console.log(`Failed to connect to ${uri}`);
    if (process.env.VERCEL) {
      console.error('Cannot start in-memory MongoDB on Vercel. Please provide a valid MONGODB_URI and ensure Vercel IPs are allowlisted.');
      throw err;
    }
    
    console.log(`Starting in-memory MongoDB fallback...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`In-memory MongoDB started and connected at ${uri}`);
      process.env.MONGODB_URI = uri;
    } catch (memErr) {
      console.error('In-memory MongoDB connection error:', memErr.message);
      throw memErr;
    }
  }
}
