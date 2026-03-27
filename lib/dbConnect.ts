import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// We remove the "throw new Error" from here so the build doesn't crash 
// if the variable is missing for a few seconds during deployment.

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Check for the URI inside the function instead
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Please add it to Vercel Environment Variables.");
    return null; 
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
