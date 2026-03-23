import { dbConnect } from "./dbConnect";
import Match from "./models/Match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // 1. Fetch data from a football data source 
    // (You can replace this URL with your preferred Odds API)
    const response = await fetch('https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=YOUR_API_KEY&regions=eu');
    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
      // 2. Logic to calculate "High Probability"
      // We look for games where the favorite has low odds (high win chance)
      const homeWinProb = 1 / item.bookmakers[0].markets[0].outcomes[0].price;
      
      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        startTime: new Date(item.commence_time),
        prediction: homeWinProb > 0.7 ? "Home Win" : "Over 1.5 Goals",
        probability: `${Math.round(homeWinProb * 100)}%`,
        isElite: homeWinProb > 0.85 // 85%+ games are locked for VIP
      };
    });

    // 3. Clear old games and save 150+ new ones
    await Match.deleteMany({ startTime: { $lt: new Date() } });
    await Match.insertMany(matchesToSave);

    return { success: true, count: matchesToSave.length };
  } catch (error) {
    console.error("Scraper Error:", error);
    return { success: false };
  }
}
