import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  // 1. GLOBAL FIRST: Broad search to fill the 100+ goal
  // 2. SPECIFIC SECOND: Targets your preferred English & International leagues
  const leagueKeys = [
    "soccer", // The global fallback key
    "soccer_england_league1", 
    "soccer_england_league2", 
    "soccer_intl_friendlies"
  ];

  try {
    let allMatches: any[] = [];

    // Loop through the keys. 'soccer' will give us the biggest initial batch.
    for (const key of leagueKeys) {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk,eu&markets=h2h`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          allMatches = [...allMatches, ...data];
        }
      }
    }

    // Remove duplicates (in case a match appears in both 'soccer' and a specific league)
    const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());

    const matchesToSave = uniqueMatches.map((item: any) => {
      // Find Betway, or fallback to any available bookie
      const bookmaker = 
        item.bookmakers?.find((b: any) => b.title.toLowerCase() === "betway") || 
        item.bookmakers?.[0];

      if (!bookmaker) return null;

      const market = bookmaker.markets?.find((m: any) => m.key === "h2h");
      if (!market) return null;

      const hPrice = market.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = market.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = market.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice || !dPrice) return null;

      // AI Probability & Reliability Logic
      const hProb = 1 / hPrice;
      const aProb = 1 / aPrice;
      const dProb = 1 / dPrice;
      const margin = (hProb + aProb + dProb) - 1;
      const reliabilityScore = 1 - margin;

      let prediction = "OVER 1.5 GOALS";
      let confidence = 0.60;

      if (hProb > 0.65) {
        prediction = "HOME WIN";
        confidence = hProb * reliabilityScore;
      } else if (aProb > 0.65) {
        prediction = "AWAY WIN";
        confidence = aProb * reliabilityScore;
      } else if (hProb > 0.45 && dProb > 0.25) {
        prediction = "1X (HOME/DRAW)";
        confidence = (hProb + dProb) * 0.8;
      }

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        prediction,
        probability: `${Math.round(confidence * 100)}%`,
        isElite: confidence > 0.78 && margin < 0.08,
        odds: { home: hPrice, draw: dPrice, away: aPrice }
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(matchesToSave);
    }

    return { 
      success: true, 
      count: matchesToSave.length, 
      message: `Global & Specific sync complete. Found ${matchesToSave.length} matches.` 
    };

  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
