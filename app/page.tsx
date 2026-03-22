"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "YOUR_API_KEY";
const PUB_ID = "pub-4608500942276282";

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [oddsData, setOddsData] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);

  // ================= FETCH FIXTURES =================
  useEffect(() => {
    const fetchFixtures = async () => {
      const date = new Date().toISOString().split("T")[0];

      const res = await axios.get(
        "https://v3.football.api-sports.io/fixtures",
        {
          params: { date },
          headers: { "x-apisports-key": API_KEY },
        }
      );

      setFixtures(res.data.response.slice(0, 15));
    };

    fetchFixtures();
  }, []);

  // ================= FETCH STATS + ODDS =================
  useEffect(() => {
    const fetchData = async () => {
      let preds = {};
      let oddsMap = {};

      for (const fix of fixtures) {
        try {
          const [home, away, odds] = await Promise.all([
            axios.get(
              "https://v3.football.api-sports.io/teams/statistics",
              {
                params: {
                  team: fix.teams.home.id,
                  league: fix.league.id,
                  season: 2024,
                },
                headers: { "x-apisports-key": API_KEY },
              }
            ),
            axios.get(
              "https://v3.football.api-sports.io/teams/statistics",
              {
                params: {
                  team: fix.teams.away.id,
                  league: fix.league.id,
                  season: 2024,
                },
                headers: { "x-apisports-key": API_KEY },
              }
            ),
            axios.get("https://v3.football.api-sports.io/odds", {
              params: { fixture: fix.fixture.id },
              headers: { "x-apisports-key": API_KEY },
            }),
          ]);

          preds[fix.fixture.id] = calculatePrediction(
            home.data.response,
            away.data.response
          );

          oddsMap[fix.fixture.id] = odds.data.response;
        } catch (e) {}
      }

      setPredictions(preds);
      setOddsData(oddsMap);
    };

    if (fixtures.length) fetchData();
  }, [fixtures]);

  // ================= MATH ENGINE =================
  const factorial = (n: number): number =>
    n === 0 ? 1 : n * factorial(n - 1);

  const poisson = (lambda: number, k: number) =>
    (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);

  const calculatePrediction = (home: any, away: any) => {
    const homeXG =
      (home.goals.for.average.home +
        away.goals.against.average.away) /
      2;

    const awayXG =
      (away.goals.for.average.away +
        home.goals.against.average.home) /
      2;

    let homeWin = 0,
      draw = 0,
      awayWin = 0;

    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        const p = poisson(homeXG, i) * poisson(awayXG, j);
        if (i > j) homeWin += p;
        else if (i === j) draw += p;
        else awayWin += p;
      }
    }

    return {
      homeProb: Math.round(homeWin * 100),
      drawProb: Math.round(draw * 100),
      awayProb: Math.round(awayWin * 100),
      homeXG,
      awayXG,
    };
  };

  // ================= ODDS =================
  const getBestOdds = (data: any) => {
    let best = { home: 0, draw: 0, away: 0 };

    data?.forEach((d: any) => {
      d.bookmakers?.forEach((b: any) => {
        b.bets?.forEach((bet: any) => {
          if (bet.name === "Match Winner") {
            bet.values.forEach((v: any) => {
              if (v.value === "Home")
                best.home = Math.max(best.home, +v.odd);
              if (v.value === "Draw")
                best.draw = Math.max(best.draw, +v.odd);
              if (v.value === "Away")
                best.away = Math.max(best.away, +v.odd);
            });
          }
        });
      });
    });

    return best;
  };

  // ================= VALUE + CONFIDENCE =================
  const getConfidence = (p: number) =>
    p > 70
      ? ["HIGH", "text-green-400"]
      : p > 55
      ? ["MEDIUM", "text-yellow-400"]
      : ["LOW", "text-red-400"];

  const isValue = (prob: number, odd: number) =>
    prob > 100 / odd;

  const getKelly = (prob: number, odd: number) => {
    const p = prob / 100;
    const b = odd - 1;
    return Math.max(((b * p - (1 - p)) / b) * 100, 0).toFixed(1);
  };

  // ================= BEST BET =================
  const getBestPick = (pred: any) => {
    if (!pred) return null;

    if (pred.homeProb > pred.awayProb && pred.homeProb > 55)
      return "HOME WIN";
    if (pred.awayProb > pred.homeProb && pred.awayProb > 55)
      return "AWAY WIN";
    return "DRAW / AVOID";
  };

  return (
    <main className="p-4 bg-black text-white min-h-screen">

      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`}
        crossOrigin="anonymous"
      />

      {fixtures.map((item, i) => {
        const pred = predictions[item.fixture.id];
        const odds = getBestOdds(oddsData[item.fixture.id]);
        const best = getBestPick(pred);

        const conf = pred
          ? getConfidence(
              Math.max(pred.homeProb, pred.awayProb)
            )
          : null;

        return (
          <div key={i} className="bg-gray-900 p-4 rounded-xl mb-6">

            <h2>
              {item.teams.home.name} vs {item.teams.away.name}
            </h2>

            <button
              onClick={() =>
                setSelectedMatch(
                  selectedMatch === item.fixture.id
                    ? null
                    : item.fixture.id
                )
              }
            >
              View Analysis
            </button>

            {selectedMatch === item.fixture.id && pred && (
              <div className="mt-4 text-sm">

                {/* PROB */}
                <p>
                  1X2 → H:{pred.homeProb}% D:{pred.drawProb}% A:{pred.awayProb}%
                </p>

                {/* CONFIDENCE */}
                <p className={conf[1]}>
                  Confidence: {conf[0]}
                </p>

                {/* ODDS */}
                <p>
                  Odds → H:{odds.home} D:{odds.draw} A:{odds.away}
                </p>

                {/* VALUE */}
                <p className="text-green-400">
                  Value:{" "}
                  {isValue(pred.homeProb, odds.home)
                    ? "HOME"
                    : isValue(pred.awayProb, odds.away)
                    ? "AWAY"
                    : "NONE"}
                </p>

                {/* KELLY */}
                <p>
                  Stake %:{" "}
                  {getKelly(
                    Math.max(pred.homeProb, pred.awayProb),
                    Math.max(odds.home, odds.away)
                  )}
                  %
                </p>

                {/* BEST PICK */}
                <p className="text-blue-400">
                  Best Bet: {best}
                </p>
              </div>
            )}

            {/* AD */}
            {i % 3 === 0 && (
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={`ca-${PUB_ID}`}
                data-ad-slot="1234567890"
              />
            )}
          </div>
        );
      })}
    </main>
  );
}
