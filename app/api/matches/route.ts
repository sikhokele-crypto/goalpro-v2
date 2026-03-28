import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Define the Schema to match your GoalPro-DB structure
const MatchSchema = new mongoose.Schema({
  homeTeam: String,
  awayTeam: String,
  league: String,
  startTime: Date,
  homeId: Number, // Used for the Poisson Math
  awayId: Number, // Used for the Poisson Math
  isElite: Boolean
});

// Avoid "Model already compiled" error
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export async function GET() {
  try {
    await dbConnect();
    // Fetch all matches, sorted by start time
    const matches = await Match.find({}).sort({ startTime: 1 });
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
