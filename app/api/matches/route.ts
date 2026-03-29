import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/lib/models/match';

export const revalidate = 60; // Refresh every minute

export async function GET() {
  await dbConnect();
  
  try {
    // We fetch from a broader set of leagues to ensure "Today" has games
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk&markets=h2h`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid API Response");
    }

    const formatted = data.map((m: any) => {
      const book = m.bookmakers?.[0];
      const market = book?.markets?.[0];

      return {
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        league: m.sport_title,
        startTime: m.commence_time,
        odds: {
          home: market?.outcomes?.find((o: any) => o.name === m.home_team)?.price || 0,
          draw: market?.outcomes?.find((o: any) => o.name === "Draw")?.price || 0,
          away: market?.outcomes?.find((o: any) => o.name === m.away_team)?.price || 0,
        },
        updatedAt: new Date()
      };
    });

    // Clear and update database with fresh Sunday games
    await Match.deleteMany({});
    const savedMatches = await Match.insertMany(formatted);

    return NextResponse.json(savedMatches);

  } catch (error) {
    console.error("Fetch Error:", error);
    // Fallback to whatever is in the DB if the API fails or hits limit
    const fallback = await Match.find({});
    return NextResponse.json(fallback);
  }
}
