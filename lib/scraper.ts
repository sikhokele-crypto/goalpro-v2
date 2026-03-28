import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // 1. THE KEY CHANGE: We use 'soccer' instead of 'upcoming' to get 100-200 matches.
    // 2. We request all markets in ONE call to stay credit-efficient (2 credits total).
    const markets = "h2h,totals,double_chance,btts,draw_no_bet";
    const apiKey = process.env.ODDS_API_KEY;
    
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${apiKey}&regions=uk,eu&markets=${markets}&bookmakers=betway,pinnacle`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API Limit or Connection Error");
    }

    const data = await response.json();

    // Map through the large list of games
    const matchesToSave = data.map((item: any) => {
      // Find Betway specifically, or use the first available bookie
      const bookmaker = item.bookmakers?.find((b: any) => b.title.toLowerCase() === "betway") || item.bookmakers?.[0];
      
      if (!bookmaker) return null;

      const getMarket = (key: string) => bookmaker.markets?.find((m: any) => m.key === key);
      
      const h2h = getMarket("h2h");
      const totals = getMarket("totals");
      const btts = getMarket("btts");
      const dc = getMarket("double_chance");
      const dnb = getMarket("draw_no_bet");

      const hPrice = h2h?.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = h2h?.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = h2h?.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      // Skip if basic odds are missing
      if (!hPrice || !aPrice) return null;

      // Simple Confidence Logic
      const hProb = 1 / hPrice;
      const aProb = 1 / aPrice;
      const prediction = hPrice < aPrice ? "HOME WIN" : "AWAY WIN";
      const confidence = Math.max(hProb, aProb);

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        prediction: hPrice < aPrice && hProb > 0.5 ? "HOME WIN" : aPrice < hPrice && aProb > 0.5 ? "AWAY WIN" : "1X (HOME/DRAW)",
        probability: `${Math.round(confidence * 100)}%`,
        odds: { home: hPrice, draw: dPrice, away: aPrice },
        vipMarkets: {
          oversUnders: totals?.outcomes[0] ? `Over ${totals.outcomes[0].point} Goals` : "Over 2.5",
          firstHalfOvers: hPrice < 2.2 ? "Over 0.5 HT" : "Under 1.5 HT",
          totalCorners: "Over 8.5 Corners",
          doubleChance: dc?.outcomes[0]?.name.replace(" / ", "/") || "1/X",
          homeTeamOvers: "Home Over 0.5",
          awayTeamOvers: "Away Over 0.5",
          btts: btts?.outcomes.find((o: any) => o.name === "Yes") ? "YES" : "NO",
          drawNoBet: dnb?.outcomes[0] ? `DNB ${dnb.outcomes[0].name}` : "N/A"
        }
      };
    }).filter(Boolean);

    // Wipe old matches and insert the fresh 150+ batch
    if (matchesToSave.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(matchesToSave);
    }

    return { success: true, count: matchesToSave.length };
  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
