import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/lib/models/match';

export const revalidate = 3600; // 1 hour edge cache

export async function GET() {
  await dbConnect();

  const oneHourAgo = new Date(Date.now() - 3600000);

  // 1. Try DB cache
  const cached = await Match.find({
    updatedAt: { $gt: oneHourAgo }
  });

  if (cached.length > 0) {
    return NextResponse.json(cached);
  }

  try {
    // 2. Fetch REAL ODDS (The Odds API)
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk&markets=h2h,totals,btts`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const formatted = data.map((m: any) => {
      const bookmaker = m.bookmakers?.[0];

      const h2h = bookmaker?.markets.find((x: any) => x.key === "h2h");

      const homeOdds = h2h?.outcomes.find((o: any) => o.name === m.home_team)?.price;
      const awayOdds = h2h?.outcomes.find((o: any) => o.name === m.away_team)?.price;
      const drawOdds = h2h?.outcomes.find((o: any) => o.name === "Draw")?.price;

      return {
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        league: m.sport_title,
        startTime: m.commence_time,
        odds: {
          home: homeOdds,
          draw: drawOdds,
          away: awayOdds,
        },
        updatedAt: new Date()
      };
    });

    await Match.deleteMany({});
    await Match.insertMany(formatted);

    return NextResponse.json(formatted);

  } catch (e) {
    const fallback = await Match.find().limit(10);
    return NextResponse.json(fallback);
  }
}
