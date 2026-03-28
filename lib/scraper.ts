import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();
  const apiKey = process.env.ODDS_API_KEY;

  try {
    // FIX 1: We remove the 'bookmakers' restriction from the URL to get EVERY match available.
    // This ensures we don't get a 0 count.
    const listRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${apiKey}&regions=uk,eu&markets=h2h`
    );

    if (!listRes.ok) throw new Error("Could not fetch match list");
    const allMatches = await listRes.json();

    if (allMatches.length === 0) {
      return { success: true, count: 0, message: "No upcoming matches found in API" };
    }

    // Process the top 40 matches (to stay within credit limits)
    const limitedMatches = allMatches.slice(0, 40);
    const processedMatches = [];

    for (const item of limitedMatches) {
      // Find the best bookmaker available for this match
      // We look for Betway first, then fallback to others
      const bookmaker = item.bookmakers?.find((b: any) => b.key === "betway") || 
                        item.bookmakers?.find((b: any) => b.key === "pinnacle") ||
                        item.bookmakers?.[0];

      if (!bookmaker) continue;

      const h2h = bookmaker.markets?.find((m: any) => m.key === "h2h");
      if (!h2h) continue;

      const hPrice = h2h.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = h2h.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = h2h.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice) continue;

      processedMatches.push({
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        // Improved Prediction Logic
        prediction: hPrice < aPrice ? "HOME WIN" : "AWAY WIN",
        probability: `${Math.round((1 / Math.min(hPrice, aPrice)) * 100)}%`,
        odds: { home: hPrice, draw: dPrice, away: aPrice },
        vipMarkets: {
          oversUnders: hPrice + aPrice < 3.5 ? "OVER 1.5" : "OVER 2.5",
          btts: (hPrice > 1.9 && aPrice > 1.9) ? "YES" : "NO",
          doubleChance: hPrice < aPrice ? "1/X" : "X/2",
          totalCorners: "OVER 8.5",
          homeTeamOvers: "OVER 0.5",
          awayTeamOvers: "OVER 0.5"
        }
      });
    }

    if (processedMatches.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(processedMatches);
    }

    return { success: true, count: processedMatches.length };
  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
