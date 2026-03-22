"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "a14dbd219f66d6191e6df8757a94771c";
const PUB_ID = "pub-4608500942276282";

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FIXTURES =================
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const date = new Date().toISOString().split("T")[0];

        const res = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {
            params: { date },
            headers: { "x-apisports-key": API_KEY },
          }
        );

        const data = res.data.response || [];
        setFixtures(data.slice(0, 10)); // limit for safety
      } catch (e) {
        console.log("Fixture fetch error");
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // ================= SIMPLE SAFE PREDICTION =================
  const getPrediction = (item: any) => {
    try {
      const h = item.teams.home.id % 100;
      const a = item.teams.away.id % 100;

      const homeProb = Math.min(70, 40 + (h % 30));
      const awayProb = Math.min(70, 40 + (a % 30));
      const drawProb = 100 - (homeProb + awayProb > 90 ? 90 : homeProb + awayProb);

      return { homeProb, drawProb, awayProb };
    } catch {
      return { homeProb: 33, drawProb: 34, awayProb: 33 };
    }
  };

  // ================= CONFIDENCE =================
  const getConfidence = (p: number) => {
    if (p > 65) return ["HIGH", "text-green-400"];
    if (p > 50) return ["MEDIUM", "text-yellow-400"];
    return ["LOW", "text-red-400"];
  };

  // ================= BEST PICK =================
  const getBestPick = (p: any) => {
    if (!p) return "Analyzing...";
    if (p.homeProb > p.awayProb && p.homeProb > 55) return "HOME WIN";
    if (p.awayProb > p.homeProb && p.awayProb > 55) return "AWAY WIN";
    return "DRAW / SKIP";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4">

      {/* ADS SCRIPT SAFE */}
      <Script
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`}
        crossOrigin="anonymous"
      />

      <h1 className="text-3xl font-black mb-6 text-blue-500">
        GOALPRO
      </h1>

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-20 animate-pulse">
          Loading matches...
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && fixtures.length === 0 && (
        <p className="text-center mt-20 text-slate-400">
          No matches available.
        </p>
      )}

      {/* MATCHES */}
      {fixtures.map((item, i) => {
        const pred = getPrediction(item);
        const conf = getConfidence(
          Math.max(pred.homeProb, pred.awayProb)
        );

        return (
          <div
            key={item.fixture.id}
            className="bg-[#0f172a] p-4 rounded-xl mb-6"
          >
            <h2 className="font-bold text-lg mb-2">
              {item.teams.home.name} vs {item.teams.away.name}
            </h2>

            <button
              className="bg-blue-600 px-3 py-1 rounded text-xs"
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

            {/* EXPANDED */}
            {selectedMatch === item.fixture.id && (
              <div className="mt-4 text-sm space-y-2">

                <p>
                  1X2 → H:{pred.homeProb}% D:{pred.drawProb}% A:{pred.awayProb}%
                </p>

                <p className={conf[1]}>
                  Confidence: {conf[0]}
                </p>

                <p className="text-blue-400">
                  Best Bet: {getBestPick(pred)}
                </p>

              </div>
            )}

            {/* SAFE AD (won’t crash) */}
            {i % 3 === 0 && (
              <div className="mt-4 text-center text-xs text-slate-500">
                Ad space
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
