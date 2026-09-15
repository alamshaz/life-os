import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Thrown lazily (at connect time) in dev if the .env isn't set up yet,
  // rather than crashing the whole build.
  console.warn("MONGODB_URI is not set. Add it to your .env.local file.");
}

// Reuse the connection across hot reloads / serverless invocations.
// Vercel functions can be reused between requests, so a fresh connection
// per request would exhaust MongoDB's connection limit fast.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
