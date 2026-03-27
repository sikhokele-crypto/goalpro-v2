import dbConnect from "./dbConnect";
// CHANGE THIS LINE to use the local relative path:
import Match from "./models/match"; 

export async function scrapeMatches() {
  await dbConnect();

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu&markets=h2h`
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
      const bookmaker = item.bookmakers?.[0];
      const market = bookmaker?.markets?.find((m: any) => m.key === "h2h");
      const homeOutcome = market?.outcomes?.find((o: any) => o.name === item.home_team);
      
      const price = homeOutcome?.price;
      if (!price) return null;

      const probValue = 1 / price;

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        startTime: new Date(item.commence_time),
        prediction: probValue > 0.6 ? "Home Win" : "Over 1.5 Goals",
        probability: `${Math.round(probValue * 100)}%`,
        isElite: probValue > 0.80,
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      await Match.deleteMany({ startTime: { $lt: new Date() } });
      await Match.insertMany(matchesToSave);
    }

    return { success: true, count: matchesToSave.length };
  } catch (error: any) {
    console.error("Scraper Error:", error);
    return { success: false, error: error.message };
  }
}
