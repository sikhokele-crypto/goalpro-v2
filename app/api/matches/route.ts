import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/lib/models/match';

export async function GET() {
  await dbConnect();
  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk&markets=h2h`,
      { cache: "no-store" }
    );
    const data = await res.json();

    const formatted = data.map((m: any) => {
      const book = m.bookmakers?.[0];
      const market = book?.markets?.[0];
      return {
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        league: m.sport_title,
        date: m.commence_time, // This fixes the "date is required" error
        startTime: m.commence_time,
        odds: {
          home: market?.outcomes?.find((o: any) => o.name === m.home_team)?.price || 0,
          draw: market?.outcomes?.find((o: any) => o.name === "Draw")?.price || 0,
          away: market?.outcomes?.find((o: any) => o.name === m.away_team)?.price || 0,
        },
        updatedAt: new Date()
      };
    });

    await Match.deleteMany({});
    const saved = await Match.insertMany(formatted);
    return NextResponse.json(saved);
  } catch (error) {
    const existing = await Match.find({});
    return NextResponse.json(existing);
  }
}
