import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGO_URI!;
export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}
