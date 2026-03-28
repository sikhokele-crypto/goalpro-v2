import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // We use the 'upcoming' endpoint which is the broadest possible search
    // Adding more regions (au, uk, us, eu) ensures we find games across all timezones
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu,uk,us,au&markets=h2h&bookmakers=betway,pinnacle,betfair_ex,williamhill,unibet_eu`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
      // 1. Try to find Betway first
      // 2. Fallback to ANY available bookmaker to ensure we don't skip the match
      const bookmaker = 
        item.bookmakers?.find((b: any) => b.title.toLowerCase() === "betway") || 
        item.bookmakers?.[0];

      if (!bookmaker) return null;

      const market = bookmaker.markets?.find((m: any) => m.key === "h2h");
      if (!market || !market.outcomes) return null;

      const hPrice = market.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = market.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = market.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice || !dPrice) return null;

      const hProb = 1 / hPrice;
      const aProb = 1 / aPrice;
      const dProb = 1 / dPrice;
      
      const margin = hProb + aProb + dProb - 1;
      const reliabilityScore = 1 - margin;

      let prediction = "";
      let confidence = 0;

      // AI Logic for Predictions
      if (hProb > 0.65) {
        prediction = "HOME WIN";
        confidence = hProb * reliabilityScore;
      } else if (aProb > 0.65) {
        prediction = "AWAY WIN";
        confidence = aProb * reliabilityScore;
      } else if (hProb > 0.45 && dProb > 0.25) {
        prediction = "1X (HOME/DRAW)";
        confidence = (hProb + dProb) * 0.8;
      } else if (hProb + aProb > 0.8) {
        prediction = "NO DRAW (12)";
        confidence = 0.75;
      } else {
        prediction = "OVER 1.5 GOALS";
        confidence = 0.6;
      }

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        prediction,
        probability: `${Math.round(confidence * 100)}%`,
        isElite: confidence > 0.78 && margin < 0.08,
        odds: {
          home: hPrice,
          draw: dPrice,
          away: aPrice,
        },
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(matchesToSave);
    }

    return {
      success: true,
      count: matchesToSave.length,
      message: `Sync complete. Found ${matchesToSave.length} matches globally.`,
    };
  } catch (error: any) {
    console.error("Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
