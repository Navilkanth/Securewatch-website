import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function connectDB() {
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/securewatch';
  
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected to ${uri}`);
  } catch (err) {
    console.log(`Failed to connect to ${uri}, starting in-memory MongoDB...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`In-memory MongoDB started and connected at ${uri}`);
      // Set the env variable so seed scripts or other processes in the same process can use it
      process.env.MONGODB_URI = uri;
    } catch (memErr) {
      console.error('In-memory MongoDB connection error:', memErr.message);
      process.exit(1);
    }
  }
}
