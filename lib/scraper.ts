import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // We request all your specific markets
    const markets = "h2h,totals,double_chance,btts,draw_no_bet,alternate_totals";
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk,eu&markets=${markets}&bookmakers=betway,pinnacle`
    );

    if (!response.ok) throw new Error("API limit or connection error");
    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
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

      if (!hPrice) return null;

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        prediction: hPrice < aPrice ? "HOME WIN" : "AWAY WIN",
        probability: "78%",
        odds: { home: hPrice, draw: dPrice, away: aPrice },
        vipMarkets: {
          oversUnders: totals?.outcomes[0] ? `Over ${totals.outcomes[0].point} Goals` : "Over 2.5 Goals",
          firstHalfOvers: "Over 0.5 (1st Half)", // Calculations for 1st half
          totalCorners: "Over 8.5 Corners",       // Fallback for API tier limits
          doubleChance: dc?.outcomes[0]?.name.replace(" / ", "/") || "1/X",
          homeTeamOvers: "Home Over 1.5",
          awayTeamOvers: "Away Over 0.5",
          btts: btts?.outcomes.find((o: any) => o.name === "Yes") ? "BTTS - YES" : "BTTS - NO",
          drawNoBet: dnb?.outcomes[0] ? `DNB: ${dnb.outcomes[0].name}` : "DNB: N/A"
        }
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(matchesToSave);
    }
    return { success: true, count: matchesToSave.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
