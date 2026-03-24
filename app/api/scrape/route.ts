import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Simulated Scraping Logic - Replace the fetch URL with your actual source if needed
    // For now, this acts as a generator to populate your DB for testing
    const mockData = [
      {
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        league: "Premier League",
        startTime: new Date(Date.now() + 3600000), // 1 hour from now
        over15Prob: 0.85,
        odds: 1.25
      },
      {
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        league: "La Liga",
        startTime: new Date(Date.now() + 7200000), // 2 hours from now
        over15Prob: 0.92,
        odds: 1.18
      }
    ];

    // Clear old matches and insert new ones
    await Match.deleteMany({});
    const savedMatches = await Match.insertMany(mockData);

    return NextResponse.json({ 
      success: true, 
      message: `${savedMatches.length} matches updated.`,
      data: savedMatches 
    });
  } catch (error: any) {
    console.error("Scrape Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
