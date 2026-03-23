import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI!;

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    // We force the dbName here to match your 'GoalPro-DB' exactly
    return await mongoose.connect(MONGODB_URI, {
      dbName: "GoalPro-DB", 
      serverSelectionTimeoutMS: 10000, // Give it 10 seconds to find the server
    });
  } catch (e) {
    console.error("CRITICAL MongoDB Connection Error:", e);
    throw e;
  }
}
