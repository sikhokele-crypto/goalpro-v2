import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/lib/models/match';

export const revalidate = 3600;

export async function GET() {
  await dbConnect();

  const oneHourAgo = new Date(Date.now() - 3600000);

  const cached = await Match.find({
    updatedAt: { $gt: oneHourAgo }
  });

  if (cached.length > 0) {
    return NextResponse.json(cached);
  }

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk&markets=h2h`,
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
        startTime: m.commence_time,
        odds: {
          home: market?.outcomes?.[0]?.price,
          draw: market?.outcomes?.[2]?.price,
          away: market?.outcomes?.[1]?.price,
        },
        updatedAt: new Date()
      };
    });

    await Match.deleteMany({});
    await Match.insertMany(formatted);

    return NextResponse.json(formatted);

  } catch {
    return NextResponse.json(cached);
  }
}
