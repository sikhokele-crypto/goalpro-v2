export async function scrapeMatches() {
  await dbConnect();

  try {
    // ONE CALL: This fetches roughly 100-200 matches globally for only 2 credits
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk,eu&markets=h2h`
    );

    if (!response.ok) throw new Error("API Limit reached or Error");
    const data = await response.json();

    // The "Internal Filter": We categorize them after they arrive
    const matchesToSave = data.map((item: any) => {
      // Find Betway or fallback
      const bookmaker = item.bookmakers?.find((b: any) => b.title.toLowerCase() === "betway") || item.bookmakers?.[0];
      if (!bookmaker) return null;

      const market = bookmaker.markets?.find((m: any) => m.key === "h2h");
      const hPrice = market?.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
      const aPrice = market?.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
      const dPrice = market?.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

      if (!hPrice || !aPrice || !dPrice) return null;

      // ... (Your AI prediction logic stays the same) ...

      return {
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.sport_title, // This will show if it's League 1, League 2, etc.
        date: item.commence_time,
        prediction: prediction, // Calculated from hPrice/aPrice
        probability: probability,
        odds: { home: hPrice, draw: dPrice, away: aPrice }
      };
    }).filter(Boolean);

    await Match.deleteMany({});
    await Match.insertMany(matchesToSave);

    return { success: true, count: matchesToSave.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
