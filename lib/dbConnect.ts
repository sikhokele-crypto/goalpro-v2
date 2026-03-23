import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI!;

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    return await mongoose.connect(MONGODB_URI, {
      dbName: "GoalPro-DB", // This forces the app to use the exact name you saw
      serverSelectionTimeoutMS: 5000,
    });
  } catch (e) {
    console.error("MongoDB Connection Error:", e);
  }
}
