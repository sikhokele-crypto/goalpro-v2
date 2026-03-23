// =======================
// lib/scraper.ts
// =======================
import { dbConnect } from "./dbConnect";
import Match from "./models/Match";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function scrapeMatches() {
  await dbConnect();

  try {
    // 1. Fetch data from The Odds API
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu&markets=h2h`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // 2. Map and Calculate Probabilities
    const matchesToSave = data
      .map((item: any) => {
        // Find the first bookmaker and the H2H market
        const bookmaker = item.bookmakers?.[0];
        const market = bookmaker?.markets?.find((m: any) => m.key === "h2h");
        const homeOutcome = market?.outcomes?.find((o: any) => o.name === item.home_team);
        
        const price = homeOutcome?.price;

        if (!price) return null;

        // Simple probability calculation (1 / decimal odds)
        const prob = 1 / price;

        return {
          homeTeam: item.home_team,
          awayTeam: item.away_team,
          league: item.sport_title,
          startTime: new Date(item.commence_time),
          prediction: prob > 0.7 ? "Home Win" : "Over 1.5 Goals",
          probability: `${Math.round(prob * 100)}%`,
          isElite: prob > 0.85, // Matches with >85% prob are marked as Elite (VIP)
        };
      })
      .filter(Boolean); // Remove nulls

    if (matchesToSave.length > 0) {
      // 3. Clean up: Remove matches that have already started
      await Match.deleteMany({ startTime: { $lt: new Date() } });

      // 4. Save new matches to MongoDB
      await Match.insertMany(matchesToSave);

      // 5. 🔥 FIX: Invalidate the specific Date Cache Key used by app/page.tsx
      const cacheKey = `matches:${new Date().toDateString()}`;
      await redis.del(cacheKey);
      
      // Also delete the old generic key just in case
      await redis.del("today_matches");
    }

    return { 
      success: true, 
      count: matchesToSave.length,
      message: matchesToSave.length === 0 ? "No matches found with valid odds." : "Sync complete."
    };
    
  } catch (error) {
    console.error("Scraper Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
