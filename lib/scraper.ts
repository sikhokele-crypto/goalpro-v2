import dbConnect from "./dbConnect";
import Match from "./models/match";

export async function scrapeMatches() {
  await dbConnect();
  const apiKey = process.env.ODDS_API_KEY;

  // We explicitly target the leagues you want to ensure they aren't skipped
  const targetLeagues = [
    "soccer_england_league1", 
    "soccer_england_league2", 
    "soccer_intl_friendlies",
    "soccer_epl",
    "soccer_england_efl_cup"
  ];

  try {
    let allProcessedMatches: any[] = [];

    // Loop through each league to ensure we get results for all of them
    for (const league of targetLeagues) {
      try {
        const res = await fetch(
          `https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${apiKey}&regions=uk,eu&markets=h2h&bookmakers=betway,pinnacle,unibet`
        );

        if (!res.ok) continue;
        const leagueData = await res.json();

        const processed = leagueData.map((item: any) => {
          const bookmaker = item.bookmakers?.[0];
          if (!bookmaker) return null;

          const h2h = bookmaker.markets?.find((m: any) => m.key === "h2h");
          const hPrice = h2h?.outcomes.find((o: any) => o.name === item.home_team)?.price || 0;
          const aPrice = h2h?.outcomes.find((o: any) => o.name === item.away_team)?.price || 0;
          const dPrice = h2h?.outcomes.find((o: any) => o.name === "Draw")?.price || 0;

          if (!hPrice || !aPrice) return null;

          return {
            homeTeam: item.home_team,
            awayTeam: item.away_team,
            league: item.sport_title,
            date: item.commence_time,
            prediction: hPrice < aPrice ? "HOME WIN" : "AWAY WIN",
            probability: `${Math.round((1 / Math.min(hPrice, aPrice)) * 100)}%`,
            odds: { home: hPrice, draw: dPrice, away: aPrice },
            vipMarkets: {
              oversUnders: hPrice < 2.0 ? "OVER 2.5" : "OVER 1.5",
              btts: (hPrice > 1.8 && aPrice > 1.8) ? "YES" : "NO",
              doubleChance: hPrice < aPrice ? "1/X" : "X/2",
              totalCorners: "OVER 8.5",
              homeTeamOvers: "OVER 0.5",
              awayTeamOvers: "OVER 0.5"
            }
          };
        }).filter(Boolean);

        allProcessedMatches = [...allProcessedMatches, ...processed];
      } catch (e) {
        console.error(`Error fetching league ${league}:`, e);
      }
    }

    // Update Database
    if (allProcessedMatches.length > 0) {
      await Match.deleteMany({});
      await Match.insertMany(allProcessedMatches);
    }

    return { success: true, count: allProcessedMatches.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
