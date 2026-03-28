import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // We change the URL to 'upcoming' and add multiple regions (eu, us, uk, au)
    // This fetches soccer matches from all major global leagues at once
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu,us,uk&markets=h2h&bookmakers=pinnacle,betfair_ex,williamhill`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
      // Find the best available odds from the bookmakers list
      const bookmaker = item.bookmakers?.[0];
      const market = bookmaker?.markets?.find((m: any) => m.key === "h2h");
      
      // We look for the Home Team outcome specifically to calculate probability
      const homeOutcome = market?.outcomes?.find((o: any) => o.name === item.home_team);
      const price = homeOutcome?.price;

      if (!price) return null;

      // Logic: Lower odds = Higher probability
      const probValue = 1 / price;

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        startTime: item.commence_time,
        // Custom prediction logic based on probability
        prediction: probValue > 0.65 ? "Home Win" : probValue > 0.45 ? "Home or Draw" : "Over 1.5 Goals",
        probability: `${Math.round(probValue * 100)}%`,
        isElite: probValue > 0.80, // Flag for high-confidence bets
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      // CLEAR EVERYTHING: This removes the old 8 games and adds the new 150+ games
      await Match.deleteMany({}); 
      await Match.insertMany(matchesToSave);
    }

    return { 
      success: true, 
      count: matchesToSave.length,
      message: `Successfully synced ${matchesToSave.length} global matches.`
    };

  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
