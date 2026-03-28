import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import axios from 'axios';

// 🛡️ THE SHIELD: Cache globally for 1 hour. 150k users = 1 credit/hour.
export const revalidate = 3600; 

const MatchSchema = new mongoose.Schema({
  fixtureId: Number,
  homeTeam: String,
  awayTeam: String,
  league: String,
  leagueCountry: String,
  startTime: Date,
  // We store these to run our Poisson math for ANY market
  homeAttack: Number, 
  homeDefense: Number,
  awayAttack: Number,
  awayDefense: Number,
  updatedAt: { type: Date, default: Date.now }
});

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export async function GET() {
  try {
    await dbConnect();

    // 1. Check MongoDB Cache first (Safety layer)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const cachedMatches = await Match.find({ updatedAt: { $gt: oneHourAgo } }).sort({ startTime: 1 });

    if (cachedMatches.length > 0) {
      return NextResponse.json(cachedMatches);
    }

    // 2. GLOBAL FETCH: This gets the next 50 matches worldwide (1 Credit)
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?next=50', {
      headers: {
        'x-apisports-key': process.env.FOOTBALL_API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const apiData = response.data.response;

    if (!apiData || apiData.length === 0) {
      const fallback = await Match.find({}).sort({ startTime: 1 }).limit(10);
      return NextResponse.json(fallback);
    }

    const formattedMatches = apiData.map((m: any) => {
      // Logic: If the team is a "Big" team, we give them higher base attack.
      // In a real pro setup, you'd fetch standings, but this keeps it fast & free.
      const isHomeFav = m.teams.home.winner === true;
      
      return {
        fixtureId: m.fixture.id,
        homeTeam: m.teams.home.name,
        awayTeam: m.teams.away.name,
        league: m.league.name,
        leagueCountry: m.league.country,
        startTime: new Date(m.fixture.date),
        // Automated Power Ratings for Poisson
        homeAttack: isHomeFav ? 1.8 : 1.2,
        homeDefense: isHomeFav ? 1.5 : 1.0,
        awayAttack: !isHomeFav ? 1.4 : 1.0,
        awayDefense: !isHomeFav ? 1.3 : 0.9,
        updatedAt: new Date()
      };
    });

    // 3. Update Database
    await Match.deleteMany({});
    await Match.insertMany(formattedMatches);

    return NextResponse.json(formattedMatches);
  } catch (error: any) {
    console.error("Global Fetch Error:", error.message);
    const emergencyCache = await Match.find({}).sort({ startTime: 1 }).limit(10);
    return NextResponse.json(emergencyCache);
  }
}
