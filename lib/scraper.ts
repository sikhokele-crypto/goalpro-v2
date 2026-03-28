import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();

  try {
    // Fetching from Global Soccer across 4 major betting regions
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu,us,uk,au&markets=h2h`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    const matchesToSave = data.map((item: any) => {
      const bookmaker = item.bookmakers?.[0];
      const market = bookmaker?.markets?.find((m: any) => m.key === "h2h");
      
      if (!market) return null;

      // Extract raw decimal odds
      const hPrice = market.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = market.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = market.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice || !dPrice) return null;

      // AI Logic Step 1: Calculate Implied Probabilities
      const hProb = 1 / hPrice;
      const aProb = 1 / aPrice;
      const dProb = 1 / dPrice;

      // AI Logic Step 2: Calculate Market Overround (Margin)
      // High margin = Bookie uncertainty. Low margin = High reliability.
      const margin = (hProb + aProb + dProb) - 1;
      const reliabilityScore = 1 - margin;

      // AI Logic Step 3: Weighted Prediction Selection
      let prediction = "";
      let confidence = 0;

      if (hProb > 0.65) {
        prediction = "HOME WIN";
        confidence = hProb * reliabilityScore;
      } else if (aProb > 0.65) {
        prediction = "AWAY WIN";
        confidence = aProb * reliabilityScore;
      } else if (hProb > 0.45 && dProb > 0.25) {
        prediction = "1X (HOME/DRAW)";
        confidence = (hProb + dProb) * 0.8;
      } else if (hProb + aProb > 0.80) {
        prediction = "NO DRAW (12)";
        confidence = 0.75;
      } else {
        prediction = "OVER 1.5 GOALS";
        confidence = 0.60;
      }

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        startTime: item.commence_time,
        prediction: prediction,
        // Show the adjusted probability percentage
        probability: `${Math.round(confidence * 100)}%`,
        // Mark as Elite if confidence is high and bookie margin is thin
        isElite: confidence > 0.78 && margin < 0.08,
      };
    }).filter(Boolean);

    if (matchesToSave.length > 0) {
      await Match.deleteMany({}); 
      await Match.insertMany(matchesToSave);
    }

    return { 
      success: true, 
      count: matchesToSave.length,
      message: `AI Analysis complete for ${matchesToSave.length} global matches.`
    };

  } catch (error: any) {
    console.error("AI Scraper Error:", error.message);
    return { success: false, error: error.message };
  }
}
