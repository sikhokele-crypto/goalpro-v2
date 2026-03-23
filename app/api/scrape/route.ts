import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Match from '@/models/Match'; // Ensure you have a Match model defined

export async function GET() {
  try {
    await dbConnect();

    // 1. YOUR SCRAPING LOGIC GOES HERE
    // Example: const games = await fetch('EXTERNAL_SOCCER_API').then(res => res.json());
    const games = [
      { teamA: "Team 1", teamB: "Team 2", probability: "85%", time: "20:00" },
      // ... more scraped data
    ];

    // 2. Save to MongoDB
    // This clears old matches and adds the new ones
    await Match.deleteMany({}); 
    await Match.insertMany(games);

    return NextResponse.json({ success: true, count: games.length });
  } catch (error: any) {
    console.error("Scrape Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
