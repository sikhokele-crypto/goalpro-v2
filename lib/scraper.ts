import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();
  const apiKey = process.env.ODDS_API_KEY;

  try {
    // STEP 1: Get the list of 150+ matches (H2H only)
    const listRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${apiKey}&regions=uk,eu&markets=h2h&bookmakers=betway`
    );

    if (!listRes.ok) throw new Error("Could not fetch match list");
    const allMatches = await listRes.json();

    // We only process the first 50 matches to save API credits, 
    // but you can increase this if you have a paid plan.
    const limitedMatches = allMatches.slice(0, 50);

    const processedMatches = [];

    // STEP 2: Loop through matches to get VIP markets (BTTS, etc.)
    for (const item of limitedMatches) {
      try {
        // Fetch detailed markets for this specific match ID
        const detailRes = await fetch(
          `https://api.the-odds-api.com/v4/sports/soccer/events/${item.id}/odds?apiKey=${apiKey}&regions=uk,eu&markets=h2h,totals,btts,draw_no_bet,double_chance&bookmakers=betway`
        );
        
        if (!detailRes.ok) continue;
        const details = await detailRes.json();
        const bookmaker = details.bookmakers?.find((b: any) => b.key === "betway") || details.bookmakers?.[0];

        if (!bookmaker) continue;

        const getMarket = (key: string) => bookmaker.markets?.find((m: any) => m.key === key);
        const h2h = getMarket("h2h");
        const totals = getMarket("totals");
        const btts = getMarket("btts");
        const dc = getMarket("double_chance");

        const hPrice = h2h?.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
        const aPrice = h2h?.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
        const dPrice = h2h?.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

        processedMatches.push({
          homeTeam: item.home_team,
          awayTeam: item.away_team,
          league: item.sport_title,
          date: item.commence_time,
          prediction: hPrice < aPrice ? "HOME WIN" : "AWAY WIN",
          probability: `${Math.round((1 / Math.min(hPrice, aPrice)) * 100)}%`,
          odds: { home: hPrice, draw: dPrice, away: aPrice },
          vipMarkets: {
            oversUnders: totals?.outcomes[0] ? `Over ${totals.outcomes[0].point}` : "Over 2.5",
            btts: btts?.outcomes.find((o: any) => o.name === "Yes") ? "YES" : "NO",
            doubleChance: dc?.outcomes[0]?.name || "1/X",
            totalCorners: "Over 8.5", // Static fallback
            homeTeamOvers: "Over 0.5",
            awayTeamOvers: "Over 0.5"
          }
        });
      } catch (e) {
        console.error(`Skipping match ${item.id} due to error`);
      }
    }

    // Wipe and Insert
    if (processedMatches.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(processedMatches);
    }

    return { success: true, count: processedMatches.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
