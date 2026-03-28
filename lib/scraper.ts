import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();
  const apiKey = process.env.ODDS_API_KEY;

  // List of all active soccer sport keys for this weekend
  const soccerKeys = [
    "soccer_england_league1",
    "soccer_england_league2",
    "soccer_intl_friendlies",
    "soccer_epl",
    "soccer_uefa_nations_league", // Active in March 2026
    "soccer_spain_la_liga",
    "soccer_italy_serie_a"
  ];

  try {
    let allProcessedMatches: any[] = [];

    // We fetch all leagues in parallel to make it fast
    const fetchPromises = soccerKeys.map(key => 
      fetch(`https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=uk,eu&markets=h2h&bookmakers=betway,pinnacle,williamhill,unibet`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );

    const results = await Promise.all(fetchPromises);
    
    // Combine all results into one flat array
    const flattenedResults = results.flat();

    allProcessedMatches = flattenedResults.map((item: any) => {
      // Pick the first available bookmaker that has odds
      const bookmaker = item.bookmakers?.[0];
      if (!bookmaker) return null;

      const h2h = bookmaker.markets?.find((m: any) => m.key === "h2h");
      const hPrice = h2h?.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = h2h?.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = h2h?.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice) return null;

      // Logic for "Confidence" and "Predictions"
      const favoriteProb = 1 / Math.min(hPrice, aPrice);
      const prediction = hPrice < aPrice ? "HOME WIN" : "AWAY WIN";

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title,
        date: item.commence_time,
        prediction: favoriteProb > 0.6 ? prediction : "1X (HOME/DRAW)",
        probability: `${Math.round(favoriteProb * 100)}%`,
        odds: { home: hPrice, draw: dPrice, away: aPrice },
        vipMarkets: {
          oversUnders: hPrice < 2.1 ? "OVER 2.5" : "OVER 1.5",
          btts: (hPrice > 1.7 && aPrice > 1.7) ? "YES" : "NO",
          doubleChance: hPrice < aPrice ? "1/X" : "X/2",
          totalCorners: "OVER 9.5",
          homeTeamOvers: "OVER 0.5",
          awayTeamOvers: "OVER 0.5"
        }
      };
    }).filter(Boolean);

    // Filter out duplicates (sometimes the API lists the same game in two categories)
    const uniqueMatches = Array.from(new Map(allProcessedMatches.map(m => [`${m.homeTeam}-${m.date}`, m])).values());

    if (uniqueMatches.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(uniqueMatches);
    }

    return { success: true, count: uniqueMatches.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
