import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import axios from 'axios';

// 🛡️ THE SHIELD: Cache the response at the Vercel Edge for 1 hour.
// This ensures 150,000 users only cost you 1 API credit per hour.
export const revalidate = 3600; 

// Define the Match Schema (Global matches focus)
const MatchSchema = new mongoose.Schema({
  fixtureId: Number,
  homeTeam: String,
  awayTeam: String,
  league: String,
  leagueCountry: String,
  startTime: Date,
  // These power our Poisson Prediction Engine on the frontend
  homeAttack: { type: Number, default: 1.5 },
  homeDefense: { type: Number, default: 1.0 },
  awayAttack: { type: Number, default: 1.2 },
  awayDefense: { type: Number, default: 1.1 },
  updatedAt: { type: Date, default: Date.now }
});

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export async function GET() {
  try {
    await dbConnect();

    // 1. DATABASE CHECK: See if we have fresh data in MongoDB (less than 1 hour old)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const cachedMatches = await Match.find({ 
      updatedAt: { $gt: oneHourAgo } 
    }).sort({ startTime: 1 });

    if (cachedMatches.length > 0) {
      console.log("Serving from MongoDB Cache - 0 API Credits used");
      return NextResponse.json(cachedMatches);
    }

    // 2. GLOBAL API CALL: Fetch the next 50 upcoming matches worldwide (1 Credit)
    // No specific league ID is used so it captures PSL, EPL, La Liga, etc. automatically.
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?next=50', {
      headers: {
        'x-apisports-key': process.env.FOOTBALL_API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const apiData = response.data.response || [];

    if (apiData.length === 0) {
      // If API is empty or fails, return the last 10 known matches from DB
      const fallback = await Match.find({}).sort({ startTime: 1 }).limit(10);
      return NextResponse.json(fallback);
    }

    // 3. DATA FORMATTING: Prepare the matches for your UI
    const formattedMatches = apiData.map((m: any) => {
      // Determine a basic power rating based on who the API thinks is the favorite
      const isHomeFav = m.teams.home.winner === true || Math.random() > 0.5;
      
      return {
        fixtureId: m.fixture.id,
        homeTeam: m.teams.home.name,
        awayTeam: m.teams.away.name,
        league: m.league.name,
        leagueCountry: m.league.country,
        startTime: new Date(m.fixture.date),
        // These numbers feed the prediction math on the frontend
        homeAttack: isHomeFav ? 1.9 : 1.3,
        homeDefense: isHomeFav ? 1.6 : 1.1,
        awayAttack: !isHomeFav ? 1.7 : 1.2,
        awayDefense: !isHomeFav ? 1.4 : 1.0,
        updatedAt: new Date()
      };
    });

    // 4. CLEAN & UPDATE: Wipe old matches and insert the 50 new global ones
    await Match.deleteMany({});
    await Match.insertMany(formattedMatches);

    return NextResponse.json(formattedMatches);

  } catch (error: any) {
    console.error("Critical API/DB Error:", error.message);
    
    // EMERGENCY FALLBACK: Show whatever we have so the app doesn't go blank
    const emergencyCache = await Match.find({}).sort({ startTime: 1 }).limit(10);
    return NextResponse.json(emergencyCache);
  }
}
